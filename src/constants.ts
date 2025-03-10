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
export const LEAGUES_NAMES = {
	CURRENT: "Current",
	STANDARD: "Standard",
	HARDCORE: "Hardcore",
	RUTHLESS: "Ruthless",
	HARDCORE_CURRENT: "Hardcore Current",
} as const;

// --- game realms ---
export const REALMS = {
	PC: "pc",
	XBOX: "xbox",
	SONY: "sony",
} as const;

//------------------------------------

export const RATE_LIMIT_STATE_KEYS = {
	POE_API_FIRST_REQUEST,
	POE_API_SECOND_REQUEST,
	POE_API_EXCHANGE_REQUEST,
	OTHER: "OTHER",
} as const;

export const POE_ERROR_CODES = {
	Accepted: 0,
	ResourceNotFound: 1,
	InvalidQuery: 2,
	RateLimitExceeded: 3,
	InternalError: 4,
	UnexpectedContentType: 5,
	Forbidden: 6,
	TemporarilyUnavailable: 7,
	Unauthorized: 8,
	MethodNotAllowed: 9,
	UnprocessableEntity: 10,
} as const;
