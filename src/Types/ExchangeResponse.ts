export type OnlineType = {
	league: string;
};

export type OfferExchangeType = {
	currency: string;
	amount: number;
	whisper: string;
};

export type OfferItemType = {
	currency: string;
	amount: number;
	stock: number;
	id: string;
	whisper: string;
};

export type AccountType = {
	name: string;
	online: OnlineType;
	lastCharacterName: string;
	language: string;
	realm: string;
};

export type OfferType = {
	exchange: OfferExchangeType;
	item: OfferItemType;
};

export type ListingType = {
	indexed: string;
	account: AccountType;
	offers: OfferType[];
	whisper: string;
	whisper_token: string;
};

export type ListingItemInfoType = {
	id: string;
	item: null;
	listing: ListingType;
};

export type ResultType = {
	[key: string]: ListingItemInfoType;
};

export type ExchangeResponseType = {
	id: string;
	complexity: null;
	result: ResultType;
	total: number;
};
