import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
} from "axios";
import {RateLimitKeys, RateStateLimitType} from "./Types/types.js";
import {
  POE_API_BASE_URL,
  POE_API_FIRST_REQUEST,
  POE_API_SECOND_REQUEST,
  RATE_LIMIT_STATE_KEYS,
} from "./constants.js";

export class HTTPRequest {
  axiosInstance: AxiosInstance;
  requestStatesRateLimitsMap = new Map<string, RateStateLimitType>();
  lastRequestTimeMap = new Map<string, Date>();
  waitTimeMap = new Map<string, number>();
  getWaitTime(key: RateLimitKeys) {
    this.updateWaitTime(key);
    return this.waitTimeMap.get(key) || 0;
  }
  updateWaitTime(key: RateLimitKeys) {
    let waitTime = this.waitTimeMap.get(key) || 0;
    const dateNow = new Date().getTime();
    const lastRequestTime = this.lastRequestTimeMap.get(key)?.getDate();
    const differenceTimeInSec = (dateNow - (lastRequestTime || dateNow)) / 1000;
    if (waitTime && waitTime !== 0 && differenceTimeInSec >= waitTime) {
      this.waitTimeMap.set(key, 0);
      return;
    }
    const states = this.requestStatesRateLimitsMap.get(key);
    if (states !== undefined) {
      const accWaitTime = this.stateCheck(
        states.accountLimitState,
        states.accountLimit,
      );
      const ipWaitTime = this.stateCheck(states.ipLimitState, states.ipLimit);
      waitTime = Math.max(accWaitTime, ipWaitTime);
    }
    if (differenceTimeInSec !== 0 && differenceTimeInSec <= waitTime) {
      waitTime = waitTime - differenceTimeInSec;
    }
    this.waitTimeMap.set(key, waitTime);
  }
  isRequestAllowed(key: RateLimitKeys) {
    return this.getWaitTime(key) === 0 ? true : false;
  }

  private stateCheck(limitState: Array<number[]>, limit: Array<number[]>) {
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
    this.axiosInstance = this.createAxiosInstance(userAgent);
    this.setupRequestInterceptors();
    this.setupResponseInterceptors();
    for (const [, value] of Object.entries(RATE_LIMIT_STATE_KEYS)) {
      this.waitTimeMap.set(value, 0);
      this.requestStatesRateLimitsMap.set(value, {
        accountLimitState: [],
        ipLimitState: [],
        accountLimit: [],
        ipLimit: [],
      });
    }
  }

  private createAxiosInstance(userAgent: string): AxiosInstance {
    const axiosConfig: CreateAxiosDefaults = {
      baseURL: POE_API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        access: "*/*",
      },
    };

    return axios.create(axiosConfig);
  }
  async delay(seconds = 10) {
    const timeInMilliseconds = seconds * 1000;
    return new Promise<void>(resolve => {
      setTimeout(resolve, timeInMilliseconds);
    });
  }

  setPoesessid(POESESSID: string | null) {
    this.axiosInstance.defaults.headers.common["Cookie"] =
      POESESSID === null ? "" : `POESESSID=${POESESSID}`;
  }

  private setupRequestInterceptors() {
    this.axiosInstance.interceptors.request.use(async config => {
      const keyLimit = this.rateLimitKey(config.url);
      if (!this.isRequestAllowed(keyLimit)) {
        throw new Error("Rate limit exceeded");
      }
      return config;
    });
  }

  private updateRateLimits(res: AxiosResponse): RateStateLimitType {
    const headers = res.headers;
    const state = {
      accountLimitState: [],
      ipLimitState: [],
      accountLimit: [],
      ipLimit: [],
    };
    const updatedState: RateStateLimitType = {...state};
    const headerMappings: Record<string, keyof RateStateLimitType> = {
      "x-rate-limit-account-state": "accountLimitState",
      "x-rate-limit-account": "accountLimit",
      "x-rate-limit-ip-state": "ipLimitState",
      "x-rate-limit-ip": "ipLimit",
    };
    for (const header in headerMappings) {
      if (headers[header.toLocaleLowerCase()]) {
        updatedState[headerMappings[header]] = headers[header]
          .split(",")
          .map((el: string) => el.split(":").map(Number));
      }
    }
    return updatedState;
  }
  private rateLimitKey(url: string | undefined): RateLimitKeys {
    let key: RateLimitKeys = RATE_LIMIT_STATE_KEYS.OTHER;
    if (url) {
      if (url.includes(POE_API_FIRST_REQUEST.replace("/:realm/:league", ""))) {
        key = RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST;
      } else if (url.includes(POE_API_SECOND_REQUEST)) {
        key = RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST;
      }
    }
    return key;
  }
  private setupResponseInterceptors() {
    this.axiosInstance.interceptors.response.use(res => {
      const keyLimit = this.rateLimitKey(res.config.url);
      this.lastRequestTimeMap.set(keyLimit, new Date());
      this.requestStatesRateLimitsMap.set(keyLimit, this.updateRateLimits(res));
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
