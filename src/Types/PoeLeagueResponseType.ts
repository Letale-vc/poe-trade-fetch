export type LeagueCategory = {
    id: string;
    current?: boolean;
};

export type LeagueRule = {
    id: string;
    name: string;
    description: string;
};

export type LeagueType = {
    id: string;
    realm: string;
    url: string;
    startAt: string | null;
    endAt: string | null;
    description: string;
    category: LeagueCategory;
    registerAt: string | null;
    delveEvent?: boolean;
    rules: LeagueRule[];
    event?: boolean;
};

export type LeagueResponseType = LeagueType[];
