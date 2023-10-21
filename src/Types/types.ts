import {LEAGUES_NAMES, RATE_LIMIT_STATE_KEYS, REALMS} from "../constants.js";

export interface ConfigInputType {
  leagueName?: LeaguesNamesType;
  userAgent?: string;
  realm?: RealmsType;
  POESESSID?: string | null;
}
export interface PoeTradeFetchConfigType {
  leagueName: LeaguesNamesType;
  userAgent: string;
  realm: RealmsType;
  POESESSID: null | string;
}
export type RealmsType = (typeof REALMS)[keyof typeof REALMS];
export type LeaguesNamesType =
  (typeof LEAGUES_NAMES)[keyof typeof LEAGUES_NAMES];
export interface RateStateLimitType {
  accountLimitState: Array<number[]>;
  ipLimitState: Array<number[]>;
  accountLimit: Array<number[]>;
  ipLimit: Array<number[]>;
}
export type RateLimitKeys =
  (typeof RATE_LIMIT_STATE_KEYS)[keyof typeof RATE_LIMIT_STATE_KEYS];
