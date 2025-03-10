import type { AxiosRequestConfig } from "axios";
import type { ExchangeResponseType } from "./Types/ExchangeResponse.js";
import type { ConfigInputType, ConfigUpdateType } from "./Types/HelperTypes.js";
import type { LeagueResponseType } from "./Types/PoeLeagueResponseType.js";
import type { PoeFirstResponse, PoeSecondResponse, TradeDataItems } from "./Types/PoeResponse.js";
import type { TradeExchangeRequestType } from "./Types/TradeExchangeRequestBodyType.js";
import type { RequestBodyType } from "./Types/TradeRequestBodyType.js";
import {
	LEAGUES_NAMES,
	POE_API_DATA_LEAGUES_URL,
	POE_API_EXCHANGE_REQUEST,
	POE_API_FIRST_REQUEST,
	POE_API_SECOND_REQUEST,
	POE_API_TRADE_DATA_ITEMS_URL,
	REALMS,
} from "./constants.js";
import { HttpRequest } from "./httpRequest/HttpRequest.js";
import type { IConfig } from "./interface/IConfig.js";
import type { IHttpRequest } from "./interface/IHttpRequest.js";
import type { IRateLimiter } from "./interface/IRateLimiter.js";
import { RateLimiter } from "./rateLimiter/RateLimiter.js";

export class PoeTradeFetch {
	private static _instance: undefined | PoeTradeFetch;
	leagueName: string;
	config: IConfig;
	httpRequest: IHttpRequest;
	rateLimiter: IRateLimiter;

	private constructor(config: ConfigInputType) {
		this.config = this.createConfig();
		this.config = { ...this.config, ...config };
		this.leagueName = LEAGUES_NAMES.STANDARD;
		this.rateLimiter = new RateLimiter();
		this.httpRequest = new HttpRequest(this.config, this.rateLimiter);
	}

	private createConfig(): IConfig {
		return {
			leagueName: LEAGUES_NAMES.STANDARD,
			userAgent: "",
			realm: REALMS.PC,
			POESESSID: null,
			useRateLimitDelay: true,
		};
	}

	async init(): Promise<void> {
		await this.updateLeagueName();
	}

	async updateConfig(config: ConfigUpdateType = {}): Promise<void> {
		this.config = { ...this.config, ...config };
		this.httpRequest.updateConfiguration();
		if (config.leagueName || this.config.leagueName) {
			await this.updateLeagueName();
		}
	}

	private async updateLeagueName(): Promise<void> {
		if (!this.config.leagueName.includes(LEAGUES_NAMES.CURRENT)) {
			this.leagueName = this.config.leagueName;
		}
		const currentLeagueName = await this.getCurrentLeagueName();
		if (!currentLeagueName) {
			throw new Error("Could not find current league name");
		}
		this.leagueName = this.config.leagueName.replace(LEAGUES_NAMES.CURRENT, currentLeagueName);
	}

	static get instance(): PoeTradeFetch {
		if (!PoeTradeFetch._instance) {
			throw new Error("Instance not created. Call createInstance() first");
		}
		return PoeTradeFetch._instance;
	}

	static createInstance(config: ConfigInputType): PoeTradeFetch {
		if (!PoeTradeFetch._instance) {
			PoeTradeFetch._instance = new PoeTradeFetch(config);
		}
		return PoeTradeFetch._instance;
	}

	async leaguesList(): Promise<LeagueResponseType> {
		return await this.httpRequest.get<LeagueResponseType>(POE_API_DATA_LEAGUES_URL);
	}

	async getCurrentLeagueName(): Promise<string | undefined> {
		const leagueList = await this.leaguesList();
		return leagueList.find((el) => el.category.current === true)?.category.id;
	}

	async getTradeDataItems(): Promise<TradeDataItems> {
		return await this.httpRequest.get<TradeDataItems>(POE_API_TRADE_DATA_ITEMS_URL);
	}

	async firsRequest(reqBody: RequestBodyType, config?: AxiosRequestConfig): Promise<PoeFirstResponse> {
		if (!this.leagueName) {
			throw Error("`leagueName` not set");
		}
		let path = POE_API_FIRST_REQUEST.replace(":league", this.leagueName);
		path =
			this.config.realm === REALMS.PC ? path.replace("/:realm", "") : path.replace(":realm", this.config.realm);
		return await this.httpRequest.post<PoeFirstResponse>(path, reqBody, config);
	}

	async secondRequest(arrayIds: string[], queryId: string, config?: AxiosRequestConfig): Promise<PoeSecondResponse> {
		let basePath = POE_API_SECOND_REQUEST;
		basePath += arrayIds.join(",");
		basePath += `?query=${queryId}`;
		if (this.config.realm !== REALMS.PC) {
			basePath += `&realm=${this.config.realm}`;
		}
		return await this.httpRequest.get<PoeSecondResponse>(basePath, config);
	}

	async exchangeRequest(
		reqBody: TradeExchangeRequestType,
		config?: AxiosRequestConfig,
	): Promise<ExchangeResponseType> {
		let path = POE_API_EXCHANGE_REQUEST.replace(":league", this.leagueName);
		path =
			this.config.realm === REALMS.PC ? path.replace("/:realm", "") : path.replace(":realm", this.config.realm);
		return await this.httpRequest.post<ExchangeResponseType>(path, reqBody, config);
	}

	static dispose() {
		PoeTradeFetch._instance = undefined;
	}

	dispose() {
		PoeTradeFetch.dispose();
	}
}
