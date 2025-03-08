export type SortType = Record<string, string>;

export type StatusType = {
	option?: string;
};

export type NameType = {
	discriminator?: string;
	option?: string;
};

export type TypeType = {
	discriminator?: string;
	option?: string;
};

export type FilterType = {
	id?: string;
	disabled?: boolean;
	value?: {
		min?: number | null;
		weight?: number;
		option?: number | null;
	};
};

export type RangeFilterType = {
	min?: number | null;
	max?: number | null;
};

export type OptionIndexedFilterType = {
	option?: "1hour" | "3hours" | "12hours" | "1day" | "3days" | "1week" | "2weeks" | "1month" | "2months" | null;
};

export type OptionFilterType = {
	option?: string | null;
};

export type InputFilterType = {
	input?: string | null;
};

export type PriceFilterType = {
	option?: string | null;
	min?: number | null;
	max?: number | null;
};

export type SocketsFilterType = {
	r?: number | null;
	g?: number | null;
	min?: number | null;
	max?: number | null;
	w?: number | null;
	b?: number | null;
};

export type LinksFilterType = {
	g?: number | null;
	r?: number | null;
	b?: number | null;
	w?: number | null;
	min?: number | null;
	max?: number | null;
};

export type StatType = {
	type?: string | null;
	filters?: FilterType[] | null;
	disabled?: boolean;
	value?: {
		min?: number | null;
		weight?: number;
		option?: number | null;
	};
};

export type MiscFiltersType = {
	filters?: {
		quality?: RangeFilterType;
		gem_level?: RangeFilterType;
		ilvl?: RangeFilterType;
		gem_level_progress?: RangeFilterType;
		gem_alternate_quality?: OptionFilterType;
		fractured_item?: OptionFilterType;
		tangled_item?: OptionFilterType;
		synthesised_item?: OptionFilterType;
		crucible_item?: OptionFilterType;
		corrupted?: OptionFilterType;
		split?: OptionFilterType;
		veiled?: OptionFilterType;
		crafted?: OptionFilterType;
		foreseeing?: OptionFilterType;
		searing_item?: OptionFilterType;
		mirrored?: OptionFilterType;
		identified?: OptionFilterType;
		talisman_tier?: RangeFilterType;
		stack_size?: RangeFilterType;
		stored_experience?: RangeFilterType;
		alternate_art?: OptionFilterType;
		foil_variation?: OptionFilterType;
	} | null;
	disabled?: boolean;
};

export type TypeFiltersType = {
	filters?: {
		rarity?: OptionFilterType;
		category?: OptionFilterType;
	} | null;
	disabled?: boolean;
};

export type TradeFiltersType = {
	filters?: {
		account?: InputFilterType;
		collapse?: OptionFilterType;
		indexed?: OptionIndexedFilterType;
		sale_type?: OptionFilterType;
		price?: PriceFilterType;
	} | null;
	disabled?: boolean;
};

export type SanctumFiltersType = {
	disabled?: boolean;
	filters?: {
		sanctum_resolve?: RangeFilterType;
		sanctum_inspiration?: RangeFilterType;
		sanctum_max_resolve?: RangeFilterType;
		sanctum_gold?: RangeFilterType;
	} | null;
};

export type HeistFiltersType = {
	disabled?: boolean;
	filters?: {
		heist_wings?: RangeFilterType;
		heist_reward_rooms?: RangeFilterType;
		heist_escape_routes?: RangeFilterType;
		heist_max_wings?: RangeFilterType;
		heist_max_reward_rooms?: RangeFilterType;
		heist_max_escape_routes?: RangeFilterType;
		heist_objective_value?: OptionFilterType;
		heist_lockpicking?: RangeFilterType;
		heist_counter_thaumaturgy?: RangeFilterType;
		heist_engineering?: RangeFilterType;
		heist_agility?: RangeFilterType;
		heist_demolition?: RangeFilterType;
		heist_deception?: RangeFilterType;
		heist_brute_force?: RangeFilterType;
		heist_trap_disarmament?: RangeFilterType;
		heist_perception?: RangeFilterType;
	} | null;
};

export type MapFiltersType = {
	disabled?: boolean;
	filters?: {
		map_tier?: RangeFilterType;
		map_iiq?: RangeFilterType;
		area_level?: RangeFilterType;
		map_iir?: RangeFilterType;
		map_packsize?: RangeFilterType;
		map_blighted?: OptionFilterType;
		map_series?: OptionFilterType;
		map_uberblighted?: OptionFilterType;
	} | null;
};

export type ReqFiltersType = {
	disabled?: boolean;
	filters?: {
		lvl?: RangeFilterType;
		dex?: RangeFilterType;
		class?: OptionFilterType;
		int?: RangeFilterType;
		str?: RangeFilterType;
	} | null;
};

export type SocketFiltersType = {
	disabled?: boolean;
	filters?: {
		sockets?: SocketsFilterType;
		links?: LinksFilterType;
	} | null;
};

export type ArmourFiltersType = {
	disabled?: boolean;
	filters?: {
		ar?: RangeFilterType;
		es?: RangeFilterType;
		block?: RangeFilterType;
		ward?: RangeFilterType;
		base_defence_percentile?: RangeFilterType;
		ev?: RangeFilterType;
	} | null;
};

export type WeaponFiltersType = {
	disabled?: boolean;
	filters?: {
		damage?: RangeFilterType;
		crit?: RangeFilterType;
		pdps?: RangeFilterType;
		aps?: RangeFilterType;
		dps?: RangeFilterType;
		edps?: RangeFilterType;
	} | null;
};

export type FiltersType = {
	misc_filters?: MiscFiltersType | null;
	type_filters?: TypeFiltersType | null;
	trade_filters?: TradeFiltersType | null;
	sanctum_filters?: SanctumFiltersType | null;
	heist_filters?: HeistFiltersType | null;
	map_filters?: MapFiltersType | null;
	req_filters?: ReqFiltersType | null;
	socket_filters?: SocketFiltersType | null;
	armour_filters?: ArmourFiltersType | null;
	weapon_filters?: WeaponFiltersType | null;
};

export type QueryType = {
	status?: StatusType | string | null;
	name?: string | NameType | null;
	type?: string | TypeType | null;
	term?: string | null;
	stats?: StatType[] | null;
	filters?: FiltersType | null;
};

export type RequestBodyType = {
	query: QueryType;
	sort?: SortType | null;
};
