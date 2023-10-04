import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';
import { RateStateLimitType } from './Types/types';
import { POE_API_BASE_URL, POE_API_FIRST_REQUEST, POE_API_SECOND_REQUEST, RATE_LIMIT_STATE_KEYS } from './constants';

export class HTTPRequest {
  axiosInstance: AxiosInstance;
  _requestStateRateLimits: Record<string, RateStateLimitType> = {};

  constructor(userAgent: string) {
    this.axiosInstance = this._createAxiosInstance(userAgent);
    this._setupRequestInterceptors();
    this._setupResponseInterceptors();

    RATE_LIMIT_STATE_KEYS.forEach((el) => {
      this._requestStateRateLimits[el] = {
        accountLimitState: [],
        ipLimitState: [],
        accountLimit: [],
        ipLimit: [],
      };
    });
  }

  _createAxiosInstance(userAgent: string): AxiosInstance {
    const axiosConfig: CreateAxiosDefaults = {
      baseURL: POE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
        access: '*/*',
      },
    };
    return axios.create(axiosConfig);
  }
  _delay(seconds = 10) {
    const timeInMilliseconds = seconds * 1200;
    return new Promise<void>((resolve) => {
      setTimeout(resolve, timeInMilliseconds);
    });
  }

  _stateCheck(rateLimitState: Array<number[]>, limit: Array<number[]>) {
    return rateLimitState.reduce(
      (acc, [current, period], index) => {
        const [maxHits] = limit[index];
        const checkViolated = current >= maxHits / 2;
        const newWaitTime = period / maxHits;
        return {
          waitTime: checkViolated ? newWaitTime : acc.waitTime,
          violated: checkViolated ? checkViolated : acc.violated,
        };
      },
      { waitTime: 0, violated: false },
    );
  }

  async _applyDelayIfViolated(rateLimitState: Array<number[]>, limit: Array<number[]>) {
    const { waitTime, violated } = this._stateCheck(rateLimitState, limit);
    if (violated) {
      await this._delay(waitTime);
    }
  }
  async _rateLimitCheck(state: RateStateLimitType) {
    await Promise.all([
      this._applyDelayIfViolated(state.accountLimitState, state.accountLimit),
      this._applyDelayIfViolated(state.ipLimitState, state.ipLimit),
    ]);
  }
  _setupRequestInterceptors() {
    this.axiosInstance.interceptors.request.use(async (config) => {
      let requestKey = 'other';
      if (config.url) {
        if (config.url.includes(POE_API_SECOND_REQUEST)) {
          requestKey = POE_API_SECOND_REQUEST;
        } else if (config.url.includes(POE_API_FIRST_REQUEST.replace('/:realm/:league', ''))) {
          requestKey = POE_API_FIRST_REQUEST;
        }
      }
      this._rateLimitCheck(this._requestStateRateLimits[requestKey]);
      return config;
    });
  }

  _updateRateLimits(res: AxiosResponse, state: RateStateLimitType): RateStateLimitType {
    const headers = res.headers;
    const updatedState: RateStateLimitType = { ...state };
    const headerMappings: Record<string, keyof RateStateLimitType> = {
      'x-rate-limit-account-state': 'accountLimitState',
      'x-rate-limit-account': 'accountLimit',
      'x-rate-limit-ip-state': 'ipLimitState',
      'x-rate-limit-ip': 'ipLimit',
    };
    for (const header in headerMappings) {
      if (headers[header.toLocaleLowerCase()]) {
        updatedState[headerMappings[header]] = headers[header]
          .split(',')
          .map((el: string) => el.split(':').map(Number));
      }
    }
    return updatedState;
  }
  _setupResponseInterceptors() {
    this.axiosInstance.interceptors.response.use((res) => {
      let requestKey = 'other';
      if (res.config.url) {
        if (res.config.url.includes(POE_API_SECOND_REQUEST)) {
          requestKey = POE_API_SECOND_REQUEST;
        } else if (res.config.url.includes(POE_API_FIRST_REQUEST.replace(':realm/:league', ''))) {
          requestKey = POE_API_FIRST_REQUEST;
        }
      }
      this._requestStateRateLimits[requestKey] = this._updateRateLimits(res, this._requestStateRateLimits[requestKey]);
      return res;
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data: object = {}, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }
}
