import {AxiosRequestConfig} from "axios";
import {HTTPRequest} from "./httpRequest.js";
import {
  ResponseLeagueListType,
  PoeTradeDataItemsResponseType,
  PoeFirstResponseType,
  PoeSecondResponseType,
} from "./Types/PoeResponseType.js";
import {RequestBodyType, QueryType} from "./Types/TradeRequestBodyType.js";
import {PoeTradeFetchConfigType, ConfigInputType} from "./Types/types.js";
import {
  DEFAULT_CONFIG,
  LEAGUES_NAMES,
  POE_API_TRADE_DATA_LEAGUES_URL,
  POE_API_TRADE_DATA_ITEMS_URL,
  POE_API_FIRST_REQUEST,
  REALMS,
  POE_API_SECOND_REQUEST,
  POE_SEARCH_PAGE_URL,
} from "./constants.js";
import * as cheerio from "cheerio";

export class PoeTradeFetch {
  static instance: PoeTradeFetch;
  leagueName: string;
  config: PoeTradeFetchConfigType = DEFAULT_CONFIG;
  httpRequest: HTTPRequest;

  constructor(config: ConfigInputType = {}) {
    // Об'єднання конфігурації за замовчуванням з переданою конфігурацією
    this.config = {...this.config, ...config};
    this.leagueName = LEAGUES_NAMES.Standard;
    this.httpRequest = new HTTPRequest(this.config.userAgent);
  }
  // constructor END

  // Метод для оновлення конфігурації
  async update(config: ConfigInputType = {}) {
    this.config = {...this.config, ...config};
    let leagueName: string = this.config.leagueName;
    if (this.config.leagueName.includes(LEAGUES_NAMES.Current)) {
      const currentLeagueName = await this.getCurrentLeagueName();
      leagueName = !currentLeagueName
        ? LEAGUES_NAMES.Standard
        : this.config.leagueName.replace(
            LEAGUES_NAMES.Current,
            currentLeagueName,
          );
    }
    this.leagueName = leagueName;
    this.httpRequest.axiosInstance.defaults.headers.common["Cookie"] = this
      .config.POESESSID
      ? `POESESSID=${this.config.POESESSID}`
      : ".js";
  }

  // Метод для отримання єдиного екземпляра класу
  static getInstance(config?: ConfigInputType): PoeTradeFetch {
    if (!PoeTradeFetch.instance) {
      PoeTradeFetch.instance = new PoeTradeFetch(config);
    }
    return PoeTradeFetch.instance;
  }

  // Метод для отримання списку доступних ліг
  async leagueNames(): Promise<ResponseLeagueListType> {
    return await this.httpRequest.get<ResponseLeagueListType>(
      POE_API_TRADE_DATA_LEAGUES_URL,
    );
  }

  // Метод для отримання назви поточної ліги
  async getCurrentLeagueName(): Promise<string | undefined> {
    const {result} = await this.leagueNames();
    const leagueName = result.find(
      el =>
        !el.id.toLowerCase().includes(LEAGUES_NAMES.Standard.toLowerCase()) &&
        !el.id.toLowerCase().includes(LEAGUES_NAMES.Hardcore.toLowerCase()) &&
        !el.id.toLowerCase().includes(LEAGUES_NAMES.Ruthless.toLowerCase()),
    )?.id;
    return leagueName;
  }

  // Метод для отримання інформації про предмети
  async tradeDataItems(): Promise<PoeTradeDataItemsResponseType> {
    return await this.httpRequest.get<PoeTradeDataItemsResponseType>(
      POE_API_TRADE_DATA_ITEMS_URL,
    );
  }

  // Перший запит, щоб отримати ідентифікатори предметів, розташованих на торгівельній платформі
  async firsRequest(
    requestQuery: RequestBodyType,
  ): Promise<PoeFirstResponseType> {
    // Додаємо лігу до URL
    let path = POE_API_FIRST_REQUEST.replace(":league", this.leagueName);
    // Замінюємо :realm на значення конфігурації realm для не-PC реалмів
    path =
      this.config.realm === REALMS.pc
        ? path.replace("/:realm", "")
        : path.replace(":realm", this.config.realm);
    return await this.httpRequest.post<PoeFirstResponseType>(
      path,
      requestQuery,
    );
  }

  // Другий запит, для отримання інформації про предмети за їх ідентифікаторами
  async secondRequest(
    arrayIds: string[],
    queryId: string,
  ): Promise<PoeSecondResponseType> {
    let basePath = POE_API_SECOND_REQUEST;
    basePath += arrayIds.join(",");
    basePath += `?query=${queryId}`;
    if (this.config.realm !== REALMS.pc) {
      basePath += `&realm=${this.config.realm}`;
    }
    return await this.httpRequest.get<PoeSecondResponseType>(basePath);
  }

  // Метод для пошуку по URL торгівельної платформи PoE
  async poeTradeSearchUrl(
    url: URL,
    poesessid: string,
  ): Promise<PoeSecondResponseType> {
    const queryId = this.getQueryIdInTradeUrl(url);
    const page = await this.getTradePage(queryId, poesessid);
    const requestBody = this._createRequestBody(page);

    const firstDelay = this.httpRequest.getWaitTime(POE_API_FIRST_REQUEST);
    await this.httpRequest.delay(firstDelay);

    const {result} = await this.firsRequest(requestBody);

    const identifiers = result.length > 10 ? result.slice(0, 10) : result;

    const secondDelay = this.httpRequest.getWaitTime(POE_API_SECOND_REQUEST);
    await this.httpRequest.delay(secondDelay);

    return await this.secondRequest(identifiers, queryId);
  }

  // Метод для отримання сторінки торгівлі за її ідентифікатором
  async getTradePage(queryId: string, poesessid?: string) {
    const baseUrl = POE_SEARCH_PAGE_URL;
    const addLeaguePath = baseUrl.replace(":league", this.leagueName);
    const addIdPath = addLeaguePath.replace(":id", queryId);
    const config: AxiosRequestConfig | undefined = poesessid
      ? {headers: {Cookie: `POESESSID=${poesessid}`}}
      : undefined;
    return await this.httpRequest.get<string>(addIdPath, config);
  }

  // Розділення URL на частини та отримання ідентифікатора запиту
  getQueryIdInTradeUrl(url: URL): string {
    const pathParts = url.pathname.split("/");
    const queryId = pathParts[pathParts.length - 1];
    return queryId;
  }

  // Отримання об'єкту тіла запиту для першого запиту
  _createRequestBody(page: string): RequestBodyType {
    const pageState = this._getPoeTradePageState(page);
    return {
      query: pageState,
      sort: {price: "asc"},
    };
  }

  // Отримання стану сторінки
  _getPoeTradePageState(page: string): QueryType {
    const cheerioPage = cheerio.load(page);
    let state: QueryType | undefined;
    cheerioPage('body script:contains("t\\(")').each((_, element) => {
      const scriptContent = cheerioPage(element).html();
      const match = scriptContent?.match(/t\(([\s\S]*?)\);/);
      if (match) {
        const jsonString = match[1];
        try {
          const data = JSON.parse(jsonString) as unknown;
          if (!!data && typeof data === "object" && "state" in data) {
            state = data.state as QueryType;
          }
        } catch (e) {
          throw new Error("Failed to parse JSON:" + e);
        }
      }
    });
    if (state === undefined) {
      throw new Error("Error page parse");
    }
    return state;
  }
}
