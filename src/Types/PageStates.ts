export interface PageStatesType<T> {
    tab: "search" | "exchange";
    realm: RealmType["id"];
    realms: RealmType[];
    leagues: LeagueType[];
    news: NewsType;
    league: LeagueType["id"];
    state: T;
}

export interface RealmType {
    id: string;
    text: string;
}

export interface LeagueType {
    id: string;
    realm: string;
    text: string;
}

export interface NewsType {
    trade_news: TradeNewsType;
}

export interface TradeNewsType {
    id: number;
    url: string;
    image: string;
}

// exchange state
export interface ExchangeStateType {
    exchange: ExchangeType;
    status: string;
}

export interface ExchangeType {
    have: HaveType;
    want: WantType;
    account?: string;
    minimum?: number;
    collapse?: boolean;
    fulfillable?: null;
}

export interface HaveType {
    [key: string]: boolean;
}

export interface WantType {
    [key: string]: boolean;
}

// search state
export interface StatValueType {
    min: number | null;
    max: number | null;
}

export interface StatFilterType {
    id: string;
    disabled: boolean;
    value: StatValueType | {option: number};
}

export interface StatGroupType {
    type: string;
    filters: StatFilterType[];
    disabled: boolean;
    value?: StatValueType;
}

export interface FiltersType {
    filters: Record<string, StatValueType>;
    disabled: boolean;
}

export interface SearchStateType {
    stats: StatGroupType[];
    status: string;
    filters?: {
        weapon_filters?: FiltersType;
        map_filters?: FiltersType;
        req_filters?: FiltersType;
        misc_filters?: FiltersType;
        type_filters?: FiltersType;
        heist_filters?: FiltersType;
        trade_filters?: FiltersType;
        armour_filters?: FiltersType;
        socket_filters?: FiltersType;
        sanctum_filters?: FiltersType;
    };
}
