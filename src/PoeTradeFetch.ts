import {
  PoeFirstResponseType,
  PoeSecondResponseType,
  PoeTradeDataItemsResponseType,
  ResponseLeagueListType,
} from './Types/PoeResponseType';
import {
  DEFAULT_CONFIG,
  LEAGUES_NAMES,
  POE_API_FIRST_REQUEST,
  POE_API_SECOND_REQUEST,
  POE_API_TRADE_DATA_ITEMS_URL,
  POE_API_TRADE_DATA_LEAGUES_URL,
  POE_SEARCH_PAGE_URL,
  REALMS,
} from './constants';
import { ConfigInputType, PoeTradeFetchConfigType } from './Types/types';
import * as cheerio from 'cheerio';
import { QueryType, RequestBodyType } from './Types/TradeRequestBodyType';
import { HTTPRequest } from './HTTPRequest';

export class PoeTradeFetch {
  static instance: PoeTradeFetch;
  leagueName: string = '';
  config: PoeTradeFetchConfigType = DEFAULT_CONFIG;
  axiosInstance: HTTPRequest;

  constructor(config: ConfigInputType = {}) {
    // Об'єднання конфігурації за замовчуванням з переданою конфігурацією
    this.config = { ...this.config, ...config };
    this.axiosInstance = new HTTPRequest(this.config.userAgent);
  }
  // constructor END

  // Метод для оновлення конфігурації
  async update(config: ConfigInputType = {}) {
    this.config = { ...this.config, ...config };
    if (this.config.leagueName.includes(LEAGUES_NAMES.Current)) {
      const currentLeagueName = await this.getCurrentLeagueName();
      this.leagueName = !currentLeagueName
        ? LEAGUES_NAMES.Standard
        : this.config.leagueName.replace(LEAGUES_NAMES.Current, currentLeagueName);
      return;
    }
    this.leagueName = this.config.leagueName;
  }

  // Метод для отримання єдиного екземпляра класу
  static async getInstance(config?: ConfigInputType): Promise<PoeTradeFetch> {
    // Якщо екземпляра ще не існує, створіть його
    if (!PoeTradeFetch.instance) {
      PoeTradeFetch.instance = new PoeTradeFetch(config);
      await PoeTradeFetch.instance.update();
    }
    return PoeTradeFetch.instance;
  }

  // Метод для отримання списку доступних ліг
  async leagueNames() {
    return (await this.axiosInstance.get<ResponseLeagueListType>(POE_API_TRADE_DATA_LEAGUES_URL)).result;
  }

  // Метод для отримання назви поточної ліги
  async getCurrentLeagueName() {
    const leagueNames = await this.leagueNames();
    const leagueName = leagueNames.find(
      (el) =>
        !el.id.toLowerCase().includes(LEAGUES_NAMES.Standard.toLowerCase()) &&
        !el.id.toLowerCase().includes(LEAGUES_NAMES.Hardcore.toLowerCase()) &&
        !el.id.toLowerCase().includes(LEAGUES_NAMES.Ruthless.toLowerCase()),
    )?.id;
    return leagueName;
  }

  // Метод для отримання інформації про предмети
  async tradeDataItems() {
    return await this.axiosInstance.get<PoeTradeDataItemsResponseType>(POE_API_TRADE_DATA_ITEMS_URL);
  }

  // Перший запит, щоб отримати ідентифікатори предметів, розташованих на торгівельній платформі
  async firsRequest(requestQuery: RequestBodyType) {
    // Додаємо лігу до URL
    let path = POE_API_FIRST_REQUEST.replace(':league', this.leagueName);
    // Замінюємо :realm на значення конфігурації realm для не-PC реалмів
    path = this.config.realm === REALMS.pc ? path.replace('/:realm', '') : path.replace(':realm', this.config.realm);
    return await this.axiosInstance.post<PoeFirstResponseType>(path, requestQuery);
  }

  // Другий запит, для отримання інформації про предмети за їх ідентифікаторами
  async secondRequest(arrayIds: string[], queryId: string) {
    let basePath = POE_API_SECOND_REQUEST;
    // Додаємо список ідентифікаторів до URL
    basePath += arrayIds.join(',');
    // Додаємо параметр запиту queryId
    basePath += `?query=${queryId}`;
    // Додаємо параметр realm, якщо це не PC
    if (this.config.realm !== REALMS.pc) {
      basePath += `&realm=${this.config.realm}`;
    }
    return await this.axiosInstance.get<PoeSecondResponseType>(basePath);
  }

  // Метод для пошуку по URL торгівельної платформи PoE
  async poeTradeSearchUrl(url: URL, poesessid: string) {
    const queryId = this.getQueryIdInTradeUrl(url);
    const page = await this.getTradePage(queryId, poesessid);
    const requestBody = this._createRequestBody(page);
    const { result } = await this.firsRequest(requestBody);
    // Вибираємо перші 10 ідентифікаторів з результату першого запиту і передаємо їх у другий запит
    const identifiers = result.length > 10 ? result.slice(0, 10) : result;
    return await this.secondRequest(identifiers, queryId);
  }

  // Метод для отримання сторінки торгівлі за її ідентифікатором
  async getTradePage(queryId: string, poesessid: string) {
    const baseUrl = POE_SEARCH_PAGE_URL;
    const addLeaguePath = baseUrl.replace(':league', this.leagueName);
    const addIdPath = addLeaguePath.replace(':id', queryId);
    return await this.axiosInstance.get<string>(addIdPath, { headers: { Cookie: `POESESSID=${poesessid}` } });
  }

  // Розділення URL на частини та отримання ідентифікатора запиту
  getQueryIdInTradeUrl(url: URL) {
    const pathParts = url.pathname.split('/');
    const queryId = pathParts[pathParts.length - 1];
    return queryId;
  }

  // Отримання об'єкту тіла запиту для першого запиту
  _createRequestBody(page: string): RequestBodyType {
    const pageState = this._getPoeTradePageState(page);
    return {
      query: pageState,
      sort: { price: 'asc' },
    };
  }

  // Отримання стану сторінки
  _getPoeTradePageState(page: string) {
    const cheerioPage = cheerio.load(page);
    let state: QueryType | undefined;
    // Пошук стану на сторінці
    cheerioPage('body script').each((_, element) => {
      const scriptContent = cheerioPage(element).html();
      const match = scriptContent?.match(/t\(([\s\S]*?)\);/);
      if (match) {
        try {
          const jsonString = match[1];
          const data = JSON.parse(jsonString);
          if (!state) state = data.state;
        } catch (e) {
          throw new Error('Failed to parse JSON:' + e);
        }
      }
    });
    // якщо стан не знайдено, робимо помилку
    if (state === undefined) {
      throw new Error('Error page parse');
    }
    return state;
  }
}
