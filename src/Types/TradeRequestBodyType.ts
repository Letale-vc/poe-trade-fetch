export interface RequestBodyType {
  query: QueryType;
  sort?: SortType;
}
export interface SortType {
  [key: string]: string;
}
export interface QueryType {
  status?: StatusType | string;
  name?: string | NameType;
  type?: string | TypeType;
  term?: string;
  stats?: StatType[];
  filters?: FiltersType;
}
interface FiltersType {
  misc_filters?: MiscFiltersType;
  type_filters?: TypeFiltersType;
  trade_filters?: TradeFiltersType;
  sanctum_filters?: SanctumFiltersType;
  heist_filters?: HeistFiltersType;
  map_filters?: MapFiltersType;
  req_filters?: ReqFiltersType;
  socket_filters?: SocketFiltersType;
  armour_filters?: ArmourFiltersType;
  weapon_filters?: WeaponFiltersType;
}
interface StatusType {
  option?: string;
}
interface NameType {
  discriminator?: string;
  option?: string;
}
interface TypeType {
  discriminator?: string;
  option?: string;
}

interface StatType {
  type?: string;
  filters?: FilterType[];
  disabled?: boolean;
  value?: {
    min?: number | null;
    weight?: number;
    option?: number | null;
  };
}

interface FilterType {
  id?: string;
  disabled?: boolean;
  value?: {
    min?: number | null;
    weight?: number;
    option?: number | null;
  };
}

interface MiscFiltersType {
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
  };
  disabled?: boolean;
}

interface TypeFiltersType {
  filters?: {
    rarity?: OptionFilterType;
    category?: OptionFilterType;
  };
  disabled?: boolean;
}

interface TradeFiltersType {
  filters?: {
    account?: InputFilterType;
    collapse?: OptionFilterType;
    indexed?: OptionFilterType;
    sale_type?: OptionFilterType;
    price?: PriceFilterType;
  };
  disabled?: boolean;
}

interface SanctumFiltersType {
  disabled?: boolean;
  filters?: {
    sanctum_resolve?: RangeFilterType;
    sanctum_inspiration?: RangeFilterType;
    sanctum_max_resolve?: RangeFilterType;
    sanctum_gold?: RangeFilterType;
  };
}

interface HeistFiltersType {
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
  };
}

interface MapFiltersType {
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
  };
}

interface ReqFiltersType {
  disabled?: boolean;
  filters?: {
    lvl?: RangeFilterType;
    dex?: RangeFilterType;
    class?: OptionFilterType;
    int?: RangeFilterType;
    str?: RangeFilterType;
  };
}

interface SocketFiltersType {
  disabled?: boolean;
  filters?: {
    sockets?: SocketsFilterType;
    links?: LinksFilterType;
  };
}

interface ArmourFiltersType {
  disabled?: boolean;
  filters?: {
    ar?: RangeFilterType;
    es?: RangeFilterType;
    block?: RangeFilterType;
    ward?: RangeFilterType;
    base_defence_percentile?: RangeFilterType;
    ev?: RangeFilterType;
  };
}

interface WeaponFiltersType {
  disabled?: boolean;
  filters?: {
    damage?: RangeFilterType;
    crit?: RangeFilterType;
    pdps?: RangeFilterType;
    aps?: RangeFilterType;
    dps?: RangeFilterType;
    edps?: RangeFilterType;
  };
}

interface RangeFilterType {
  min?: number | null;
  max?: number | null;
}

interface OptionFilterType {
  option?: string | null;
}

interface InputFilterType {
  input?: string | null;
}

interface PriceFilterType {
  option?: string | null;
  min?: number | null;
  max?: number | null;
}

interface SocketsFilterType {
  r?: number | null;
  g?: number | null;
  min?: number | null;
  max?: number | null;
  w?: number | null;
  b?: number | null;
}

interface LinksFilterType {
  g?: number | null;
  r?: number | null;
  b?: number | null;
  w?: number | null;
  min?: number | null;
  max?: number | null;
}
