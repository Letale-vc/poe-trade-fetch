import type { LeaguesNamesType, RealmsType } from "../Types/HelperTypes.js";

export interface IConfig {
	leagueName: LeaguesNamesType;
	userAgent: string;
	realm: RealmsType;
	POESESSID: null | string;
	useRateLimitDelay: boolean;
}
