import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';

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
import { ConfigInputType } from './Types/types';
import * as cheerio from 'cheerio';
import { QueryType, RequestBodyType } from './Types/TradeRequestBodyType';

export class PoeTradeFetch {
  static instance: PoeTradeFetch;
  leagueName: string = '';

  config = DEFAULT_CONFIG;
  axiosInstance: AxiosInstance;
  // state rate limit
  accountLimitState: number[] = [1, 4, 0];
  ipLimitState: number[] = [1, 4, 0];

  constructor(config: ConfigInputType = {}) {
    // Об'єднання конфігурації за замовчуванням з переданою конфігурацією
    this.config = { ...this.config, ...config };
    const axiosConfig: CreateAxiosDefaults = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': this.config.userAgent,
        access: '*/*',
      },
    };
    this.axiosInstance = axios.create(axiosConfig);
    // Додавання перехоплювача запитів для затримки перед кожним запитом
    this.axiosInstance.interceptors.request.use(async (config) => {
      // Перевірка поточного стану лімітів для облікового запису та IP
      const [accountCurrent, accountPeriod, accountTime] = this.accountLimitState;
      const [ipCurrent, ipPeriod, ipTime] = this.ipLimitState;
      // Якщо поточний стан не перевищує ліміти, продовжуємо
      if (accountCurrent < accountPeriod && ipCurrent < ipPeriod) {
        // У випадку порушення лімітів обчислюємо, скільки часу потрібно почекати
        const waitTime = Math.max(accountTime, ipTime);
        console.log(`Exceeding limits. We wait ${waitTime} seconds.`);
        // Затримка на вказану кількість секунд
        await delay(waitTime);
      }
      return config;
    });

    // Перехоплювач відповідей для оновлення стану обмежень на основі заголовків відповідей
    this.axiosInstance.interceptors.response.use((res) => {
      // Updating the state of limits based on response headers
      const headers = res.headers;
      const accountState = headers['X-Rate-Limit-Account-State'];
      const ipState = headers['X-Rate-Limit-Ip-State'];
      if (accountState) {
        this.accountLimitState = accountState.split(':').map(Number);
      }
      if (ipState) {
        this.ipLimitState = ipState.split(':').map(Number);
      }
      return res;
    });
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
    }
    return PoeTradeFetch.instance;
  }

  // Метод для отримання списку доступних ліг
  async leagueNames() {
    const { data } = await this.axiosInstance.get<ResponseLeagueListType>(POE_API_TRADE_DATA_LEAGUES_URL);
    return data.result;
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
    const { data } = await this.axiosInstance.get<PoeTradeDataItemsResponseType>(POE_API_TRADE_DATA_ITEMS_URL);
    return data;
  }

  // Перший запит, щоб отримати ідентифікатори предметів, розташованих на торгівельній платформі
  async firsRequest(requestQuery: RequestBodyType) {
    // Додаємо лігу до URL
    const url = POE_API_FIRST_REQUEST.replace(':league', this.leagueName);
    // Замінюємо :realm на значення конфігурації realm для не-PC реалмів
    this.config.realm === REALMS.pc ? url.replace('/:realm', '') : url.replace(':realm', this.config.realm);

    const { data } = await this.axiosInstance.post<PoeFirstResponseType>(url, requestQuery);
    return data;
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
    const { data } = await this.axiosInstance.get<PoeSecondResponseType>(url.toString());
    return data;
  }

  // Метод для пошуку по URL торгівельної платформи PoE
  async poeTradeSearchUrl(url: URL, poesessid: string) {
    const queryId = this.getQueryIdInTradeUrl(url);
    const page = await this.getTradePage(queryId, poesessid);
    const requestBody = this.getRequestBody(page);
    const { result } = await this.firsRequest(requestBody);
    // Вибираємо перші 10 ідентифікаторів з результату першого запиту і передаємо їх у другий запит
    const identifiers = result.length > 10 ? result.slice(0, 9) : result;
    return await this.secondRequest(identifiers, queryId);
  }

  // Метод для отримання сторінки торгівлі за її ідентифікатором
  async getTradePage(queryId: string, poesessid: string) {
    this.axiosInstance.defaults.headers.common['Cookie'] = `POESESSID=${poesessid}`;
    const baseUrl = POE_SEARCH_PAGE_URL;
    const addLeagueUrl = baseUrl.replace(':league', this.leagueName);
    const addQueryId = addLeagueUrl.replace(':id', queryId);
    const url = new URL(addQueryId);
    const { data } = await this.axiosInstance.get<string>(url.toString());
    return data;
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
