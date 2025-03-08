export type PageStatesType<T> = {
	tab: "search" | "exchange";
	realm: RealmType["id"];
	realms: RealmType[];
	leagues: LeagueType[];
	news: NewsType;
	league: LeagueType["id"];
	state: T;
};

export type RealmType = {
	id: string;
	text: string;
};

export type LeagueType = {
	id: string;
	realm: string;
	text: string;
};

export type NewsType = {
	trade_news: TradeNewsType;
};

export type TradeNewsType = {
	id: number;
	url: string;
	image: string;
};

// exchange state
export type ExchangeStateType = {
	exchange: ExchangeType;
	status: string;
};

export type ExchangeType = {
	have: HaveType;
	want: WantType;
	account?: string;
	minimum?: number;
	collapse?: boolean;
	fulfillable?: null;
};

export type HaveType = {
	[key: string]: boolean;
};

export type WantType = {
	[key: string]: boolean;
};

// search state
export type StatValueType = {
	min: number | null;
	max: number | null;
};

export type StatFilterType = {
	id: string;
	disabled: boolean;
	value: StatValueType | { option: number };
};

export type StatGroupType = {
	type: string;
	filters: StatFilterType[];
	disabled: boolean;
	value?: StatValueType;
};

export type StateFiltersType = {
	filters: Record<string, StatValueType>;
	disabled: boolean;
};

export type SearchStateType = {
	stats: StatGroupType[];
	status: string;
	filters?: {
		weapon_filters?: StateFiltersType;
		map_filters?: StateFiltersType;
		req_filters?: StateFiltersType;
		misc_filters?: StateFiltersType;
		type_filters?: StateFiltersType;
		heist_filters?: StateFiltersType;
		trade_filters?: StateFiltersType;
		armour_filters?: StateFiltersType;
		socket_filters?: StateFiltersType;
		sanctum_filters?: StateFiltersType;
	};
};
