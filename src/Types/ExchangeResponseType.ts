export interface ExchangeResponseType {
  id: string;
  complexity: null;
  result: ResultType;
  total: number;
}

export interface ResultType {
  [key: string]: ListingItemInfoType;
}

export interface ListingItemInfoType {
  id: string;
  item: null;
  listing: ListingType;
}

export interface ListingType {
  indexed: string;
  account: AccountType;
  offers: OfferType[];
  whisper: string;
  whisper_token: string;
}

export interface AccountType {
  name: string;
  online: OnlineType;
  lastCharacterName: string;
  language: string;
  realm: string;
}

export interface OnlineType {
  league: string;
}

export interface OfferType {
  exchange: ExchangeType;
  item: ItemType;
}

export interface ExchangeType {
  currency: string;
  amount: number;
  whisper: string;
}

export interface ItemType {
  currency: string;
  amount: number;
  stock: number;
  id: string;
  whisper: string;
}
