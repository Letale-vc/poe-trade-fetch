export interface TradeExchangeRequestType {
  query: ExchangeQuery;
  sort?: Sort;
  engine?: "new";
}

export interface ExchangeQuery {
  status?: Status | string;
  have?: string[];
  want?: string[];
  minimum?: number;
  collapse?: boolean;
  account?: string;
  fulfillable?: null;
}

export interface Status {
  option: string;
}

export interface Sort {
  have: string;
}
