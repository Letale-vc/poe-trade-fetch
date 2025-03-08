import type { AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import type { ExchangeResponseType } from "./Types/ExchangeResponse.js";
import type {
	ConfigInputType,
	ConfigType,
	ConfigUpdateType,
	PoeTradePageStates,
	PoeTradeStateTypes,
} from "./Types/HelperTypes.js";
import type { ExchangeStateType } from "./Types/PageStates.js";
import type { LeagueResponseType } from "./Types/PoeLeagueResponseType.js";
import type { PoeFirstResponse, PoeSecondResponse, TradeDataItems } from "./Types/PoeResponse.js";
import type { ExchangeQuery, TradeExchangeRequestType } from "./Types/TradeExchangeRequestBodyType.js";
import type { RequestBodyType } from "./Types/TradeRequestBodyType.js";
import {
	DEFAULT_CONFIG,
	LEAGUES_NAMES,
	POE_API_DATA_LEAGUES_URL,
	POE_API_EXCHANGE_REQUEST,
	POE_API_FIRST_REQUEST,
	POE_API_SECOND_REQUEST,
	POE_API_TRADE_DATA_ITEMS_URL,
	POE_SEARCH_PAGE_URL,
	REALMS,
} from "./constants.js";
import { HttpRequest } from "./httpRequest/HttpRequest.js";
import type { IHttpRequest } from "./interface/IHttpRequest.js";
import { PoeTradeFetchError } from "./poeTradeFetchError.js";

export class PoeTradeFetch {
	private static _instance: undefined | PoeTradeFetch;
	leagueName: string;
	config: ConfigType;
	httpRequest: IHttpRequest;

	private constructor(config: ConfigInputType) {
		this.config = DEFAULT_CONFIG;
		this.config = { ...this.config, ...config };
		this.leagueName = LEAGUES_NAMES.Standard;
		this.httpRequest = new HttpRequest(this.config);
	}

	async init() {
		await this.updateLeagueName();
	}

	async updateConfig(config: ConfigUpdateType = {}) {
		this.config = { ...this.config, ...config };
		this.httpRequest.updateConfiguration();
		await this.updateLeagueName();
	}

	async updateLeagueName() {
		if (!this.config.leagueName.includes(LEAGUES_NAMES.Current)) {
			this.leagueName = this.config.leagueName;
		}
		const currentLeagueName = await this.getCurrentLeagueName();
		if (!currentLeagueName) {
			throw new PoeTradeFetchError(
				new Error(`${LEAGUES_NAMES.Current} league not found, try using another league`),
			);
		}
		this.leagueName = this.config.leagueName.replace(LEAGUES_NAMES.Current, currentLeagueName);
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

	async leagueList(): Promise<LeagueResponseType> {
		return await this.httpRequest.get<LeagueResponseType>(POE_API_DATA_LEAGUES_URL);
	}

	async getCurrentLeagueName(): Promise<string | undefined> {
		const leagueList = await this.leagueList();
		return leagueList.find((el) => el.category.current === true)?.category.id;
	}

	async getTradeDataItems(): Promise<TradeDataItems> {
		return await this.httpRequest.get<TradeDataItems>(POE_API_TRADE_DATA_ITEMS_URL);
	}

	async firsRequest(requestQuery: RequestBodyType, config?: AxiosRequestConfig): Promise<PoeFirstResponse> {
		let path = POE_API_FIRST_REQUEST.replace(":league", this.leagueName);
		path =
			this.config.realm === REALMS.pc ? path.replace("/:realm", "") : path.replace(":realm", this.config.realm);
		return await this.httpRequest.post<PoeFirstResponse>(path, requestQuery, config);
	}

	async secondRequest(arrayIds: string[], queryId: string, config?: AxiosRequestConfig): Promise<PoeSecondResponse> {
		let basePath = POE_API_SECOND_REQUEST;
		basePath += arrayIds.join(",");
		basePath += `?query=${queryId}`;

		if (this.config.realm !== REALMS.pc) {
			basePath += `&realm=${this.config.realm}`;
		}

		return await this.httpRequest.get<PoeSecondResponse>(basePath, config);
	}

	async exchangeRequest(
		requestBody: TradeExchangeRequestType,
		config?: AxiosRequestConfig,
	): Promise<ExchangeResponseType> {
		let path = POE_API_EXCHANGE_REQUEST.replace(":league", this.leagueName);
		path =
			this.config.realm === REALMS.pc ? path.replace("/:realm", "") : path.replace(":realm", this.config.realm);
		return await this.httpRequest.post<ExchangeResponseType>(path, requestBody, config);
	}

	async fetchExchangeUrl(url: URL, poesessid?: string): Promise<ExchangeResponseType> {
		const queryId = this.getQueryIdInTradeUrl(url);
		const page = await this.getTradePage(queryId, poesessid);
		const { state } = this.getPoeTradePageState<ExchangeStateType>(page);
		const body = this.createExchangeBody(state);
		return await this.exchangeRequest(body);
	}

	createExchangeBody(state: ExchangeStateType): TradeExchangeRequestType {
		const { have, want, ...optional } = state.exchange;
		let query: ExchangeQuery = {
			status: { option: "online" },
			have: Object.keys(state.exchange.have),
			want: Object.keys(state.exchange.want),
		};
		const optionalKeys: (keyof typeof optional)[] = ["account", "minimum", "collapse", "fulfillable"];

		for (const key of optionalKeys) {
			if (key in optional && optional[key] !== undefined && optional[key] !== null) {
				query = { ...query, [key]: optional[key] };
			}
		}

		return {
			query,
			sort: { have: "asc" },
			engine: "new",
		};
	}

	async poeTradeSearchUrl(url: URL, poesessid?: string): Promise<PoeSecondResponse> {
		const queryId = this.getQueryIdInTradeUrl(url);
		const page = await this.getTradePage(queryId, poesessid);
		const requestBody = this.createSearchRequestBody(page);
		const { result } = await this.firsRequest(requestBody);
		const identifiers = result.length > 10 ? result.slice(0, 10) : result;
		return await this.secondRequest(identifiers, queryId);
	}

	async getTradePage(queryId: string, poesessid?: string): Promise<string> {
		const baseUrl = POE_SEARCH_PAGE_URL;
		const addLeaguePath = baseUrl.replace(":league", this.leagueName);
		const addIdPath = addLeaguePath.replace(":id", queryId);
		const config: AxiosRequestConfig | undefined = poesessid
			? { headers: { Cookie: `POESESSID=${poesessid}` } }
			: undefined;
		return await this.httpRequest.get<string>(addIdPath, config);
	}

	getQueryIdInTradeUrl(url: URL): string {
		const pathParts = url.pathname.split("/");
		const queryId = pathParts[pathParts.length - 1];
		return queryId;
	}

	createSearchRequestBody(page: string): RequestBodyType {
		const { state } = this.getPoeTradePageState(page);
		return {
			query: state,
			sort: { price: "asc" },
		};
	}

	getPoeTradePageState<T extends PoeTradeStateTypes, S = PoeTradePageStates<T>>(page: string): S {
		const cheerioPage = cheerio.load(page);
		let state: S | null = null;

		cheerioPage('body script:contains("t\\(")').each((_, element) => {
			const scriptContent = cheerioPage(element).html();
			if (!scriptContent) return;
			const match = scriptContent.match(/t\(\s*({[^;]+})\s*\);/);
			if (!match) return;
			const jsonString = match[1];
			try {
				const parsedPageStates = JSON.parse(jsonString);
				if (this.isValidPageStates<S>(parsedPageStates)) {
					state = parsedPageStates;
				}
			} catch (e) {
				throw new PoeTradeFetchError(new Error(`Failed to parse JSON: ${e}`));
			}
		});
		if (!state) {
			throw new PoeTradeFetchError(new Error("Page state not found"));
		}
		return state;
	}

	private isValidPageStates<S>(parsedPageStates: unknown): parsedPageStates is S {
		if (typeof parsedPageStates !== "object" || !parsedPageStates) {
			return false;
		}
		const requiredKeys = ["state", "league", "tab", "realm", "realms", "leagues"];
		return requiredKeys.every((key) => key in parsedPageStates);
	}

	static dispose() {
		PoeTradeFetch._instance = undefined;
	}

	dispose() {
		PoeTradeFetch.dispose();
	}
}
