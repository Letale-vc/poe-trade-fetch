import type { ConfigType } from "./Types";

//  PoE API URLs -----------------------------
export const POE_API_BASE_URL = "https://www.pathofexile.com/";
export const POE_SEARCH_PAGE_URL = "trade/search/:league/:id";
export const POE_API_DATA_LEAGUES_URL = "api/leagues";
export const POE_API_TRADE_DATA_ITEMS_URL = "api/trade/data/items/";
export const POE_API_TRADE_DATA_STATIC_URL = "api/trade/data/static/";
export const POE_API_TRADE_DATA_STATS_URL = "api/trade/data/stats/";
// ------ These URLs require delay --------------
export const POE_API_FIRST_REQUEST = "api/trade/search/:realm/:league";
export const POE_API_SECOND_REQUEST = "api/trade/fetch/";
export const POE_API_EXCHANGE_REQUEST = "api/trade/exchange/:league";
// -------------------------------

// --- League names  ---
export const LEAGUES_NAMES = Object.freeze({
    Current: "Current",
    Standard: "Standard",
    Hardcore: "Hardcore",
    Ruthless: "Ruthless",
    HardcoreCurrent: "Hardcore Current",
});

//--------------------------------------------

// --- game realms ---
export const REALMS = Object.freeze({
    pc: "pc",
    xbox: "xbox",
    sony: "sony",
});

//------------------------------------

// Default config for PoeTradeApi

export const DEFAULT_CONFIG: ConfigType = Object.freeze({
    leagueName: LEAGUES_NAMES.Standard,
    userAgent: "",
    realm: REALMS.pc,
    POESESSID: null,
    useRateLimitDelay: true,
});

export const RATE_LIMIT_STATE_KEYS = Object.freeze({
    POE_API_FIRST_REQUEST,
    POE_API_SECOND_REQUEST,
    POE_API_EXCHANGE_REQUEST,
    OTHER: "OTHER",
});

export const POE_ERROR_CODES = Object.freeze({
    0: "Accepted",
    1: "Resource not found",
    2: "Invalid query",
    3: "Rate limit exceeded",
    4: "Internal error",
    5: "Unexpected content type",
    8: "Unauthorized",
    6: "Forbidden",
    7: "Temporarily Unavailable",
    9: "Method not allowed",
    10: "Unprocessable Entity",
});
