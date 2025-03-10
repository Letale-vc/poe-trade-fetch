import type { LEAGUES_NAMES, RATE_LIMIT_STATE_KEYS, REALMS } from "../constants.js";
import type { IConfig } from "../interface/IConfig.js";

export type ConfigInputType = Partial<IConfig> & Pick<IConfig, "userAgent">;
export type ConfigUpdateType = Partial<IConfig>;
export type RealmsType = (typeof REALMS)[keyof typeof REALMS];
export type LeaguesNamesType = (typeof LEAGUES_NAMES)[keyof typeof LEAGUES_NAMES];
export type RateLimitKeys = (typeof RATE_LIMIT_STATE_KEYS)[keyof typeof RATE_LIMIT_STATE_KEYS];
