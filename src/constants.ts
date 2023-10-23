//  PoE API URLs -----------------------------
export const POE_API_BASE_URL = "https://www.pathofexile.com/";
export const POE_SEARCH_PAGE_URL = "trade/search/:league/:id";
export const POE_API_TRADE_DATA_LEAGUES_URL = "api/trade/data/leagues/";
export const POE_API_TRADE_DATA_ITEMS_URL = "api/trade/data/items/";
export const POE_API_TRADE_DATA_STATIC_URL = "api/trade/data/static/";
export const POE_API_TRADE_DATA_STATS_URL = "api/trade/data/stats/";
// ------ These URLs require delay --------------
export const POE_API_FIRST_REQUEST = "api/trade/search/:realm/:league";
export const POE_API_SECOND_REQUEST = "api/trade/fetch/";
export const POE_API_EXCHANGE_REQUEST = "api/trade/exchange/:league";
// -------------------------------

// --- League names  ---
export const LEAGUES_NAMES = {
  Current: "Current",
  Standard: "Standard",
  Hardcore: "Hardcore",
  Ruthless: "Ruthless",
  HCRuthless: "HC Ruthless",
  HCRuthlessCurrent: "HC Ruthless Current",
  RuthlessCurrent: "Ruthless Current",
  HardcoreCurrent: "Hardcore Current",
} as const;

//--------------------------------------------

// --- game realms ---
export const REALMS = {
  pc: "pc",
  xbox: "xbox",
  sony: "sony",
} as const;

//------------------------------------

// Default config for PoeTradeApi
export const DEFAULT_CONFIG = {
  leagueName: LEAGUES_NAMES.Standard,
  userAgent: "poe-trade-fetch",
  realm: REALMS.pc,
  POESESSID: null,
} as const;

// export const RATE_LIMIT_STATE_KEYS = [POE_API_FIRST_REQUEST, POE_API_SECOND_REQUEST, 'other'];

export const RATE_LIMIT_STATE_KEYS = {
  POE_API_FIRST_REQUEST,
  POE_API_SECOND_REQUEST,
  POE_API_EXCHANGE_REQUEST,
  OTHER: "OTHER",
} as const;
