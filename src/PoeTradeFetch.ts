import {AxiosRequestConfig} from "axios";
import {
  PoeTradeDataItemsResponseType,
  PoeFirstResponseType,
  PoeSecondResponseType,
} from "./Types/PoeResponseType.js";
import {RequestBodyType} from "./Types/TradeRequestBodyType.js";
import {PoeTradeFetchConfigType, ConfigInputType} from "./Types/types.js";
import {
  DEFAULT_CONFIG,
  LEAGUES_NAMES,
  POE_API_DATA_LEAGUES_URL,
  POE_API_TRADE_DATA_ITEMS_URL,
  POE_API_FIRST_REQUEST,
  REALMS,
  POE_API_SECOND_REQUEST,
  POE_SEARCH_PAGE_URL,
  POE_API_EXCHANGE_REQUEST,
} from "./constants.js";
import * as cheerio from "cheerio";
import {TradeExchangeRequestType} from "./Types/TradeExchangeRequestBodyType.js";
import {ExchangeResponseType} from "./Types/ExchangeResponseType.js";
import {
  ExchangeStateType,
  PageStatesType,
  SearchStateType,
} from "./Types/PageStates.js";
import {HttpRequest} from "./httpRequest/HttpRequest.js";
import {LeagueResponseType} from "./Types/PoeLeagueResponseType.js";

export class PoeTradeFetch {
  static instance: PoeTradeFetch;
  leagueName: string;
  config: PoeTradeFetchConfigType = DEFAULT_CONFIG;
  httpRequest: HttpRequest;

  constructor(config: ConfigInputType) {
    // Об'єднання конфігурації за замовчуванням з переданою конфігурацією
    this.config = {...this.config, ...config};
    this.leagueName = LEAGUES_NAMES.Standard;
    this.httpRequest = new HttpRequest(this.config);
  }
  // constructor END

  // Метод для оновлення конфігурації
  async update(config: ConfigInputType) {
    this.config = {...this.config, ...config};
    this.httpRequest.updateConfig(this.config);
    if (this.config.leagueName.includes(LEAGUES_NAMES.Current)) {
      const currentLeagueName = await this.getCurrentLeagueName();
      if (currentLeagueName === undefined) {
        console.warn(
          `[POE TRADE FETCH]: ${LEAGUES_NAMES.Current} league not found, using ${LEAGUES_NAMES.Standard} instead`,
        );
        this.leagueName = LEAGUES_NAMES.Standard;
      } else {
      }
      this.leagueName = this.config.leagueName.replace(
        LEAGUES_NAMES.Current,
        currentLeagueName as string,
      );
    } else {
      this.leagueName = this.config.leagueName;
    }
  }

  // Метод для отримання єдиного екземпляра класу
  static getInstance(config: ConfigInputType): PoeTradeFetch {
    if (!PoeTradeFetch.instance) {
      PoeTradeFetch.instance = new PoeTradeFetch(config);
    }
    return PoeTradeFetch.instance;
  }

  // Метод для отримання списку доступних ліг
  async leagueList(): Promise<LeagueResponseType> {
    return await this.httpRequest.get<LeagueResponseType>(
      POE_API_DATA_LEAGUES_URL,
    );
  }

  // Метод для отримання назви поточної ліги
  async getCurrentLeagueName(): Promise<string | undefined> {
    const leagueList = await this.leagueList();
    return leagueList.find(
      el =>
        el.endAt !== null &&
        new Date(el.endAt) > new Date() &&
        el.category.current === true,
    )?.category.id;
  }

  // Метод для отримання інформації про предмети
  async getTradeDataItems(): Promise<PoeTradeDataItemsResponseType> {
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

  async exchangeRequest(
    requestBody: TradeExchangeRequestType,
  ): Promise<ExchangeResponseType> {
    let path = POE_API_EXCHANGE_REQUEST.replace(":league", this.leagueName);
    path =
      this.config.realm === REALMS.pc
        ? path.replace("/:realm", "")
        : path.replace(":realm", this.config.realm);

    return await this.httpRequest.post<ExchangeResponseType>(path, requestBody);
  }
  async fetchExchangeUrl(
    url: URL,
    poesessid?: string,
  ): Promise<ExchangeResponseType> {
    const queryId = this.getQueryIdInTradeUrl(url);
    const page = await this.getTradePage(queryId, poesessid);
    const {state} = this.getPoeTradePageState<ExchangeStateType>(page);
    const body = this.createExchangeBody(state);

    return await this.exchangeRequest(body);
  }

  createExchangeBody(state: ExchangeStateType): TradeExchangeRequestType {
    const transformedData: TradeExchangeRequestType = {
      query: {
        status: {option: "online"},
        have: Object.keys(state.exchange.have),
        want: Object.keys(state.exchange.want),
      },
      sort: {have: "asc"},
      engine: "new",
    };
    if ("account" in state.exchange) {
      transformedData.query.account = state.exchange.account;
    }
    if ("minimum" in state.exchange) {
      transformedData.query.minimum = state.exchange.minimum;
    }
    if ("collapse" in state.exchange) {
      transformedData.query.collapse = state.exchange.collapse;
    }
    if ("fulfillable" in state.exchange) {
      transformedData.query.fulfillable = state.exchange.fulfillable;
    }
    return transformedData;
  }
  // Метод для пошуку по URL торгівельної платформи PoE
  async poeTradeSearchUrl(
    url: URL,
    poesessid?: string,
  ): Promise<PoeSecondResponseType> {
    const queryId = this.getQueryIdInTradeUrl(url);
    const page = await this.getTradePage(queryId, poesessid);
    const requestBody = this.createSearchRequestBody(page);

    const {result} = await this.firsRequest(requestBody);

    const identifiers = result.length > 10 ? result.slice(0, 10) : result;

    return await this.secondRequest(identifiers, queryId);
  }

  // Метод для отримання сторінки торгівлі за її ідентифікатором
  async getTradePage(queryId: string, poesessid?: string): Promise<string> {
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
  createSearchRequestBody(page: string): RequestBodyType {
    const {state} = this.getPoeTradePageState(page);
    return {
      query: state,
      sort: {price: "asc"},
    };
  }

  getPoeTradePageState<
    T extends ExchangeStateType | SearchStateType,
    S extends PageStatesType<T> = PageStatesType<T>,
  >(page: string): S {
    const cheerioPage = cheerio.load(page);
    let state: S | null = null;
    cheerioPage('body script:contains("t\\(")').each((_, element) => {
      const scriptContent = cheerioPage(element).html();
      const match = scriptContent?.match(/t\(\s*({[^;]+})\s*\);/);
      if (!!match) {
        const jsonString = match[1];
        try {
          const parsedPageStates = JSON.parse(jsonString);
          if (this.isValidPageStates(parsedPageStates)) {
            state = parsedPageStates as S;
          } else {
            throw new Error("Unknown page state structure");
          }
        } catch (e) {
          throw new Error(`Failed to parse JSON: ${e}`);
        }
      }
    });
    if (state === null) {
      throw new Error("Error page parse");
    }
    return state;
  }
  private isValidPageStates(parsedPageStates: object): boolean {
    return (
      parsedPageStates.hasOwnProperty("state") &&
      parsedPageStates.hasOwnProperty("league") &&
      parsedPageStates.hasOwnProperty("tab") &&
      parsedPageStates.hasOwnProperty("realm") &&
      parsedPageStates.hasOwnProperty("realms") &&
      parsedPageStates.hasOwnProperty("leagues") &&
      parsedPageStates.hasOwnProperty("league")
    );
  }
}
