//  PoE API URLs -----------------------------
export const POE_SEARCH_PAGE_URL = 'https://www.pathofexile.com/trade/search/:league/:id';
export const POE_API_TRADE_DATA_LEAGUES_URL = 'https://www.pathofexile.com/api/trade/data/leagues/';
export const POE_API_TRADE_DATA_ITEMS_URL = 'https://www.pathofexile.com/api/trade/data/items/';
export const POE_API_TRADE_DATA_STATIC_URL = 'https://www.pathofexile.com/api/trade/data/static/';
export const POE_API_TRADE_DATA_STATS_URL = 'https://www.pathofexile.com/api/trade/data/stats/';
// ------ These URLs require delay --------------
export const POE_API_FIRST_REQUEST = 'https://www.pathofexile.com/api/trade/search/:realm/:league';
export const POE_API_SECOND_REQUEST = 'https://www.pathofexile.com/api/trade/fetch/';
// -------------------------------

// --- League names  ---
export const LEAGUES_NAMES = {
  Current: 'Current',
  Standard: 'Standard',
  Hardcore: 'Hardcore',
  Ruthless: 'Ruthless',
  HCRuthless: 'HC Ruthless',
  HCRuthlessCurrent: 'HC Ruthless Current',
  RuthlessCurrent: 'Ruthless Current',
  HardcoreCurrent: 'Hardcore Current',
};

//--------------------------------------------

// --- game realms ---
export const REALMS = {
  pc: '',
  xbox: 'xbox',
  sony: 'sony',
};

//------------------------------------

// Default config for PoeTradeApi
export const DEFAULT_CONFIG = {
  leagueName: LEAGUES_NAMES.Standard,
  userAgent: 'PoE Trade Fetch https://github.com/Letale-vc/poe-trade-fetch',
  realm: REALMS.pc,
};
