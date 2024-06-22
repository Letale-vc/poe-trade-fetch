export type Sort = {
    have: string;
};

export type Status = {
    option: string;
};

export type ExchangeQuery = {
    status?: Status | string;
    have?: string[];
    want?: string[];
    minimum?: number;
    collapse?: boolean;
    account?: string;
    fulfillable?: null;
};

export type TradeExchangeRequestType = {
    query: ExchangeQuery;
    sort?: Sort;
    engine?: "new";
};
