import axios, { AxiosInstance, AxiosResponse, CreateAxiosDefaults } from 'axios';
import {
  PoeFirstResponseType,
  PoeSecondResponseType,
  PoeTradeDataItemsResponseType,
  ResponseLeagueListType,
} from './Types/PoeResponseType';
import { delay } from './Helpers';
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
import { ConfigInputType, PoeTradeFetchConfigType, RateStateLimitType } from './Types/types';
import * as cheerio from 'cheerio';
import { QueryType, RequestBodyType } from './Types/TradeRequestBodyType';

export class PoeTradeFetch {
  static instance: PoeTradeFetch;
  leagueName: string = '';
  config: PoeTradeFetchConfigType = DEFAULT_CONFIG;
  axiosInstance: AxiosInstance;
  // state rate limit
  firstRequestStateLimit = {
    accountLimit: [[3, 5, 60]],
    accountLimitState: [[1, 4, 0]],
    ipLimit: [
      [8, 10, 60],
      [15, 60, 120],
      [60, 300, 1800],
    ],
    ipLimitState: [[1, 4, 0]],
  };
  secondRequestStateLimit = {
    accountLimit: [[6, 4, 10]],
    accountLimitState: [[1, 4, 0]],
    ipLimit: [
      [12, 4, 60],
      [16, 12, 60],
    ],
    ipLimitState: [[1, 4, 0]],
  };

  constructor(config: ConfigInputType = {}) {
    // Об'єднання конфігурації за замовчуванням з переданою конфігурацією
    this.config = { ...this.config, ...config };
    this.axiosInstance = this._createAxiosInstance();
    // Додавання перехоплювача запитів для затримки перед кожним запитом
    this._setupRequestInterceptors();
    // Перехоплювач відповідей для оновлення стану обмежень на основі заголовків відповідей
    this._setupResponseInterceptors();
  }
  // constructor END

  _createAxiosInstance(): AxiosInstance {
    const axiosConfig: CreateAxiosDefaults = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': this.config.userAgent,
        access: '*/*',
      },
    };
    return axios.create(axiosConfig);
  }
  async _rateLimitCheck(state: RateStateLimitType) {
    const checkState = async (rateLimitState: Array<number[]>, limit: Array<number[]>) => {
      const { waitTime } = rateLimitState.reduce(
        (acc, [current, period], index) => {
          const violated = current >= period - 1;
          return { waitTime: violated ? limit[index][2] : acc.waitTime, violated };
        },
        { waitTime: 0, violated: false },
      );
      await delay(waitTime);
    };
    await Promise.all([
      checkState(state.accountLimitState, state.accountLimit),
      checkState(state.ipLimitState, state.ipLimit),
    ]);
  }
  _setupRequestInterceptors() {
    this.axiosInstance.interceptors.request.use(async (config) => {
      if (config.url && config.url.includes(POE_API_SECOND_REQUEST)) {
        await this._rateLimitCheck(this.secondRequestStateLimit);
      } else {
        await this._rateLimitCheck(this.firstRequestStateLimit);
      }
      return config;
    });
  }
  _updateRateLimits(res: AxiosResponse, state: RateStateLimitType): RateStateLimitType {
    const headers = res.headers;
    const updatedState = { ...state };
    const headerMappings: Record<string, keyof RateStateLimitType> = {
      'X-Rate-Limit-Account-State': 'accountLimitState',
      'X-Rate-Limit-Account': 'accountLimit',
      'X-Rate-Limit-Ip-State': 'ipLimitState',
      'X-Rate-Limit-Ip': 'ipLimit',
    };
    for (const header in headerMappings) {
      if (headers[header]) {
        updatedState[headerMappings[header]] = headers[header]
          .split(',')
          .map((el: string) => el.split(':').map(Number));
      }
    }
    return updatedState;
  }
  _setupResponseInterceptors() {
    this.axiosInstance.interceptors.response.use((res) => {
      if (res.config.url && res.config.url.includes(POE_API_SECOND_REQUEST)) {
        this.secondRequestStateLimit = this._updateRateLimits(res, this.secondRequestStateLimit);
      } else if (res.config.url && res.config.url.includes(POE_API_FIRST_REQUEST.replace('/:realm/:league', ''))) {
        this.firstRequestStateLimit = this._updateRateLimits(res, this.firstRequestStateLimit);
      }
      return res;
    });
  }

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
    }
    return PoeTradeFetch.instance;
  }

  // Метод для отримання списку доступних ліг
  async leagueNames() {
    return (await this.axiosInstance.get<ResponseLeagueListType>(POE_API_TRADE_DATA_LEAGUES_URL)).data.result;
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
    return (await this.axiosInstance.get<PoeTradeDataItemsResponseType>(POE_API_TRADE_DATA_ITEMS_URL)).data;
  }

  // Перший запит, щоб отримати ідентифікатори предметів, розташованих на торгівельній платформі
  async firsRequest(requestQuery: RequestBodyType) {
    // Додаємо лігу до URL
    let url = POE_API_FIRST_REQUEST.replace(':league', this.leagueName);
    // Замінюємо :realm на значення конфігурації realm для не-PC реалмів
    url = this.config.realm === REALMS.pc ? url.replace('/:realm', '') : url.replace(':realm', this.config.realm);
    return (await this.axiosInstance.post<PoeFirstResponseType>(url, requestQuery)).data;
  }

  // Другий запит, для отримання інформації про предмети за їх ідентифікаторами
  async secondRequest(arrayIds: string[], queryId: string) {
    const baseUrl = POE_API_SECOND_REQUEST;
    const url = new URL(baseUrl);
    // Додаємо список ідентифікаторів до URL
    url.pathname += arrayIds.join(',');
    // Додаємо параметр запиту queryId
    url.searchParams.set('query', queryId);
    // Додаємо параметр realm, якщо це не PC
    if (this.config.realm !== REALMS.pc) {
      url.searchParams.set('realm', this.config.realm);
    }
    return (await this.axiosInstance.get<PoeSecondResponseType>(url.toString())).data;
  }

  // Метод для пошуку по URL торгівельної платформи PoE
  async poeTradeSearchUrl(url: URL, poesessid: string) {
    const queryId = this.getQueryIdInTradeUrl(url);
    const page = await this.getTradePage(queryId, poesessid);
    const requestBody = this.getRequestBody(page);
    const { result } = await this.firsRequest(requestBody);
    // Вибираємо перші 10 ідентифікаторів з результату першого запиту і передаємо їх у другий запит
    const identifiers = result.length > 10 ? result.slice(0, 10) : result;
    return await this.secondRequest(identifiers, queryId);
  }

  // Метод для отримання сторінки торгівлі за її ідентифікатором
  async getTradePage(queryId: string, poesessid: string) {
    this.axiosInstance.defaults.headers.common['Cookie'] = `POESESSID=${poesessid}`;
    const baseUrl = POE_SEARCH_PAGE_URL;
    const addLeagueUrl = baseUrl.replace(':league', this.leagueName);
    const addQueryId = addLeagueUrl.replace(':id', queryId);
    const url = new URL(addQueryId);
    return (await this.axiosInstance.get<string>(url.toString())).data;
  }

  // Розділення URL на частини та отримання ідентифікатора запиту
  getQueryIdInTradeUrl(url: URL) {
    const pathParts = url.pathname.split('/');
    const queryId = pathParts[pathParts.length - 1];
    return queryId;
  }

  // Отримання об'єкту тіла запиту для першого запиту
  getRequestBody(page: string): RequestBodyType {
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
