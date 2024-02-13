import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
} from "axios";
import {ConfigType, RateLimitKeys, RateStateLimitType} from "../Types/types.js";
import {
  POE_API_BASE_URL,
  POE_API_FIRST_REQUEST,
  POE_API_SECOND_REQUEST,
  RATE_LIMIT_STATE_KEYS,
} from "../constants.js";
import {RateLimiter} from "../rateLimiter/RateLimiter.js";
import {delay} from "../utility/utility.js";

export class HttpRequest {
  axiosInstance: AxiosInstance;
  rateLimiter = new RateLimiter();
  lastRequestRegistryKey: string | undefined;
  useRateLimitDelay = true;
  constructor(appSettings: ConfigType) {
    this.axiosInstance = this.createAxiosInstance(appSettings.userAgent);
    this.setupRequestInterceptors();
    this.setupResponseInterceptors();
    this.useRateLimitDelay = appSettings.useRateLimitDelay;
  }
  updateConfig(appSettings: ConfigType) {
    this.useRateLimitDelay = appSettings.useRateLimitDelay;
    this.axiosInstance.defaults.headers["User-Agent"] = appSettings.userAgent;
    this.setPoesessidAsDefault(appSettings.POESESSID);
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

  setPoesessidAsDefault(POESESSID: string | null) {
    this.axiosInstance.defaults.headers.common["Cookie"] =
      POESESSID === null ? "" : `POESESSID=${POESESSID}`;
  }

  private setupRequestInterceptors() {
    this.axiosInstance.interceptors.request.use(async config => {
      let limitKey = this.getRateLimitKey(config.url);
      if (config.httpAgent) {
        config.headers["x-proxy-host"] = config.httpsAgent.host;
        limitKey = `${limitKey}-${config.httpsAgent.host}`;
      }

      if (this.useRateLimitDelay) {
        const waitTime = this.rateLimiter.getWaitTime(limitKey);
        await delay(waitTime);
      }

      if (!this.rateLimiter.canMakeRequest(limitKey)) {
        throw new Error("Rate limit exceeded");
      }
      return config;
    });
  }

  private getNewRateLimits(res: AxiosResponse): RateStateLimitType {
    const headers = res.headers;
    const updatedState: RateStateLimitType = {
      accountLimitState: [],
      ipLimitState: [],
      accountLimit: [],
      ipLimit: [],
      lastResponseTime: Date.now(),
    };
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
  private getRateLimitKey(url: string | undefined): string {
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
      let limitKey = this.getRateLimitKey(res.config.url);
      if (res.headers["x-proxy-host"]) {
        limitKey = `${limitKey}-${res.headers["x-proxy-host"]}`;
      }

      const rateLimits = this.getNewRateLimits(res);
      this.rateLimiter.setRateLimitInfo(limitKey, rateLimits);
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
