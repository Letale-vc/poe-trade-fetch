import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type CreateAxiosDefaults,
} from "axios";
import type {
    ConfigType,
    RateLimitKeys,
    RateStateLimitType,
} from "../Types/types.js";
import {
    POE_API_BASE_URL,
    POE_API_FIRST_REQUEST,
    POE_API_SECOND_REQUEST,
    RATE_LIMIT_STATE_KEYS,
} from "../constants.js";
import { PoeTradeFetchError } from "../poeTradeFetchError.js";
import { RateLimiter } from "../rateLimiter/RateLimiter.js";
import { delay } from "../utility/delay.js";

export class HttpRequest {
    private _appSetting: ConfigType;
    axiosInstance: AxiosInstance;
    rateLimiter = new RateLimiter();
    lastRequestRegistryKey: string | undefined;

    constructor(appSettings: ConfigType) {
        this._appSetting = appSettings;
        this.axiosInstance = this.createAxiosInstance();
        this.setupRequestInterceptors();
        this.setupResponseInterceptors();
    }

    updateConfiguration() {
        this.axiosInstance.defaults.headers["User-Agent"] =
            this._appSetting.userAgent;
        this.setPoesessidAsDefault();
        this.setupResponseInterceptors();
        this.setupRequestInterceptors();
    }

    private createAxiosInstance(): AxiosInstance {
        const axiosConfig: CreateAxiosDefaults = {
            baseURL: POE_API_BASE_URL,
            headers: {
                "Content-Type": "application/json",
                "User-Agent": this._appSetting.userAgent,
                access: "*/*",
            },
        };

        return axios.create(axiosConfig);
    }

    setPoesessidAsDefault() {
        this.axiosInstance.defaults.headers.common.Cookie = !this._appSetting
            .POESESSID
            ? ""
            : `POESESSID=${this._appSetting.POESESSID}`;
    }

    private setupRequestInterceptors() {
        this.axiosInstance.interceptors.request.use(async config => {
            if (this._appSetting.useRateLimitDelay) {
                let limitKey = this.getRateLimitKey(config.url);

                if (config.httpAgent) {
                    config.headers["x-proxy-host"] = config.httpsAgent.host;
                    limitKey = `${limitKey}-${config.httpsAgent.host}`;
                }

                const waitTime = this.rateLimiter.getWaitTime(limitKey);
                await delay(waitTime);
            }

            return config;
        });
    }

    private parseRateLimitHeaders(res: AxiosResponse): RateStateLimitType {
        const headers = res.headers;
        const state: RateStateLimitType = {
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
        for (const [header, mappedHeader] of Object.entries(headerMappings)) {
            if (headers[header.toLocaleLowerCase()]) {
                state[mappedHeader] = headers[header]
                    .split(",")
                    .map((el: string) => el.split(":").map(Number));
            }
        }
        return state;
    }

    getRateLimitKey(url: string | undefined): string {
        let key: RateLimitKeys = RATE_LIMIT_STATE_KEYS.OTHER;

        if (url) {
            if (
                url.includes(
                    POE_API_FIRST_REQUEST.replace("/:realm/:league", ""),
                )
            ) {
                key = RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST;
            } else if (url.includes(POE_API_SECOND_REQUEST)) {
                key = RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST;
            }
        }

        return key;
    }

    private setupResponseInterceptors(): void {
        this.axiosInstance.interceptors.response.use(
            res => {
                let limitKey = this.getRateLimitKey(res.config.url);

                if (res.headers["x-proxy-host"]) {
                    limitKey = `${limitKey}-${res.headers["x-proxy-host"]}`;
                }

                const rateLimits = this.parseRateLimitHeaders(res);
                this.rateLimiter.setRateLimitInfo(limitKey, rateLimits);

                return res;
            },
            error => {
                throw new PoeTradeFetchError(error);
            },
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
    }

    async post<T>(
        url: string,
        data: object = {},
        config?: AxiosRequestConfig,
    ): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }
}
