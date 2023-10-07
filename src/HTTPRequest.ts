import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';
import { RateLimitKeys, RateStateLimitType } from './Types/types';
import { POE_API_BASE_URL, POE_API_FIRST_REQUEST, POE_API_SECOND_REQUEST, RATE_LIMIT_STATE_KEYS } from './constants';

export class HTTPRequest {
  axiosInstance: AxiosInstance;
  _requestStatesRateLimitsMap = new Map<string, RateStateLimitType>();
  _lastRequestTimeMap = new Map<string, Date>();
  _waitTimeMap = new Map<string, number>();
  getWaitTime(key: RateLimitKeys) {
    this.updateWaitTime(key);
    return this._waitTimeMap.get(key) || 0;
  }
  updateWaitTime(key: RateLimitKeys) {
    let waitTime = this._waitTimeMap.get(key) || 0;
    const dateNow = new Date().getTime();
    const lastRequestTime = this._lastRequestTimeMap.get(key)?.getDate();
    const differenceTimeInSec = (dateNow - (lastRequestTime || dateNow)) / 1000;
    if (waitTime && waitTime !== 0 && differenceTimeInSec >= waitTime) {
      this._waitTimeMap.set(key, 0);
      return;
    }
    const states = this._requestStatesRateLimitsMap.get(key);
    if (states !== undefined) {
      const accWaitTime = this._stateCheck(states.accountLimitState, states.accountLimit);
      const ipWaitTime = this._stateCheck(states.ipLimitState, states.ipLimit);
      waitTime = Math.max(accWaitTime, ipWaitTime);
    }
    if (differenceTimeInSec !== 0 && differenceTimeInSec <= waitTime) {
      waitTime = waitTime - differenceTimeInSec;
    }
    this._waitTimeMap.set(key, waitTime);
  }
  isRequestAllowed(key: RateLimitKeys) {
    return this.getWaitTime(key) === 0 ? true : false;
  }

  _stateCheck(limitState: Array<number[]>, limit: Array<number[]>) {
    return limitState.reduce((acc, [current, period], index) => {
      let time = acc;
      const [maxHits] = limit[index];
      const checkViolated = current >= maxHits;
      if (checkViolated && acc < period) {
        time = period;
      }
      return time;
    }, 0);
  }
  constructor(userAgent: string) {
    this.axiosInstance = this._createAxiosInstance(userAgent);
    this._setupRequestInterceptors();
    this._setupResponseInterceptors();
    for (const [_, value] of Object.entries(RATE_LIMIT_STATE_KEYS)) {
      this._waitTimeMap.set(value, 0);
      this._requestStatesRateLimitsMap.set(value, {
        accountLimitState: [],
        ipLimitState: [],
        accountLimit: [],
        ipLimit: [],
      });
    }
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
  async delay(seconds = 10) {
    const timeInMilliseconds = seconds * 1000;
    return new Promise<void>((resolve) => {
      setTimeout(resolve, timeInMilliseconds);
    });
  }

  _setupRequestInterceptors() {
    this.axiosInstance.interceptors.request.use(async (config) => {
      const keyLimit = this._rateLimitKey(config.url);
      if (!this.isRequestAllowed(keyLimit)) {
        throw new Error('Rate limit exceeded');
      }
      return config;
    });
  }

  _updateRateLimits(res: AxiosResponse): RateStateLimitType {
    const headers = res.headers;
    const state = {
      accountLimitState: [],
      ipLimitState: [],
      accountLimit: [],
      ipLimit: [],
    };
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
  _rateLimitKey(url: string | undefined): RateLimitKeys {
    let key = RATE_LIMIT_STATE_KEYS.OTHER;
    if (url) {
      if (url.includes(POE_API_FIRST_REQUEST.replace('/:realm/:league', ''))) {
        key = RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST;
      } else if (url.includes(POE_API_SECOND_REQUEST)) {
        key = RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST;
      }
    }
    return key;
  }
  _setupResponseInterceptors() {
    this.axiosInstance.interceptors.response.use((res) => {
      const keyLimit = this._rateLimitKey(res.config.url);
      this._lastRequestTimeMap.set(keyLimit, new Date());
      this._requestStatesRateLimitsMap.set(keyLimit, this._updateRateLimits(res));
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
