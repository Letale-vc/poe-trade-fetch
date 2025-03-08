import type { LEAGUES_NAMES, RATE_LIMIT_STATE_KEYS, REALMS } from "../constants.js";
import type { ExchangeStateType, PageStatesType, SearchStateType } from "./PageStates.js";

export type ConfigInputType = Partial<ConfigType> & Pick<ConfigType, "userAgent">;

export type ConfigUpdateType = Partial<ConfigType>;

export interface ConfigType {
	leagueName: LeaguesNamesType;
	userAgent: string;
	realm: RealmsType;
	POESESSID: null | string;
	useRateLimitDelay: boolean;
}
export type RealmsType = (typeof REALMS)[keyof typeof REALMS];
export type LeaguesNamesType = (typeof LEAGUES_NAMES)[keyof typeof LEAGUES_NAMES];
export interface RateStateLimitType {
	accountLimitState: Array<number[]>;
	ipLimitState: Array<number[]>;
	accountLimit: Array<number[]>;
	ipLimit: Array<number[]>;
	lastResponseTime: number;
}
export type RateLimitKeys = (typeof RATE_LIMIT_STATE_KEYS)[keyof typeof RATE_LIMIT_STATE_KEYS];

export type PoeTradeStateTypes = ExchangeStateType | SearchStateType;
export type PoeTradePageStates<T extends PoeTradeStateTypes> = PageStatesType<T>;
