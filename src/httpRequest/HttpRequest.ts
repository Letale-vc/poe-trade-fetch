import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type CreateAxiosDefaults } from "axios";
import type { PoeError } from "../Types/PoeErrorMessage.js";
import { POE_API_BASE_URL, POE_ERROR_CODES } from "../constants.js";
import type { IConfig } from "../interface/IConfig.js";
import type { IHttpRequest } from "../interface/IHttpRequest.js";
import type { IRateLimiter } from "../interface/IRateLimiter.js";
import { PoeTradeError } from "../poeTradeFetchErrors.js";
import { delay } from "../utility/delay.js";

export class HttpRequest implements IHttpRequest {
	private readonly _appSetting: IConfig;
	private readonly _rateLimiter;
	readonly axiosInstance: AxiosInstance;
	lastRequestRegistryKey: string | undefined;

	constructor(appSettings: IConfig, rateLimiter: IRateLimiter) {
		this._appSetting = appSettings;
		this.axiosInstance = this.createAxiosInstance();
		this.setupRequestInterceptors();
		this.setupResponseInterceptors();
		this._rateLimiter = rateLimiter;
	}

	updateConfiguration(): void {
		this.axiosInstance.defaults.headers["User-Agent"] = this._appSetting.userAgent;
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

	setPoesessidAsDefault(): void {
		this.axiosInstance.defaults.headers.common.Cookie = !this._appSetting.POESESSID
			? ""
			: `POESESSID=${this._appSetting.POESESSID}`;
	}

	private setupRequestInterceptors(): void {
		this.axiosInstance.interceptors.request.use(async (config) => {
			if (this._appSetting.useRateLimitDelay) {
				let limitKey = this._rateLimiter.getRateLimitKey(config.url);
				if (config.httpAgent) {
					config.headers["x-proxy-host"] = config.httpsAgent.host;
					limitKey = `${limitKey}-${config.httpsAgent.host}`;
				}
				const waitTime = this._rateLimiter.getWaitTime(limitKey);
				await delay(waitTime);
			}
			return config;
		});
	}

	private setupResponseInterceptors(): void {
		this.axiosInstance.interceptors.response.use(
			(res) => {
				let limitKey = this._rateLimiter.getRateLimitKey(res.config.url);
				if (res.headers["x-proxy-host"]) {
					limitKey = `${limitKey}-${res.headers["x-proxy-host"]}`;
				}
				this._rateLimiter.setRateLimitInfo(limitKey, res.headers);
				return res;
			},
			(error: AxiosError<PoeError>) => {
				throw this.mapError(error);
			},
		);
	}

	private mapError(axiosError: AxiosError<PoeError>): PoeTradeError {
		const status = axiosError.response?.status;
		const responseData = axiosError.response?.data;
		const errorCode = responseData?.error.code ?? -1;
		const errorMessage = (responseData?.error.message ?? axiosError.message) || "Unknown error";
		const retryAfter =
			errorCode === POE_ERROR_CODES.RateLimitExceeded
				? Number.parseInt(axiosError.response?.headers["retry-after"] || "0", 10)
				: undefined;

		const baseURL = axiosError.config?.baseURL ?? "";
		const urlPath = axiosError.config?.url ?? "unknown";
		const fullUrl = baseURL && urlPath ? `${baseURL}${urlPath}` : urlPath;
		const method = axiosError.config?.method?.toUpperCase() ?? "UNKNOWN";

		return new PoeTradeError(
			errorCode,
			`${method} request to ${fullUrl} failed: ${errorMessage}`,
			status,
			retryAfter,
			{
				response: responseData,
				originalError: axiosError,
			},
		);
	}

	async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return (await this.axiosInstance.get<T>(url, config)).data;
	}

	async post<T>(url: string, data: object = {}, config?: AxiosRequestConfig): Promise<T> {
		return (await this.axiosInstance.post<T>(url, data, config)).data;
	}
}
