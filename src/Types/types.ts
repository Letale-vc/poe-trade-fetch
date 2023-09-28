import { LEAGUES_NAMES, REALMS } from '../constants';

export interface ConfigInputType {
  leagueName?: LeaguesNamesType;
  userAgent?: string;
  realm?: RealmsType;
}
export interface PoeTradeFetchConfigType {
  leagueName: LeaguesNamesType;
  userAgent: string;
  realm: RealmsType;
}
export type RealmsType = (typeof REALMS)[keyof typeof REALMS];
export type LeaguesNamesType = (typeof LEAGUES_NAMES)[keyof typeof LEAGUES_NAMES];
export interface RateStateLimitType {
  accountLimitState: Array<number[]>;
  ipLimitState: Array<number[]>;
  accountLimit: Array<number[]>;
  ipLimit: Array<number[]>;
}
