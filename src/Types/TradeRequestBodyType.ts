export interface RequestBodyType {
  query: QueryType;
  sort: SortType;
}
export interface SortType {
  [key: string]: string;
}
export interface QueryType {
  status?: Status;
  name?: string | Name;
  type?: string | Type;
  term?: string;
  stats?: Stat[];
  filters?: Filters;
}
interface Filters {
  misc_filters: MiscFilters;
  type_filters: TypeFilters;
  trade_filters: TradeFilters;
  sanctum_filters: SanctumFilters;
  heist_filters: HeistFilters;
  map_filters: MapFilters;
  req_filters: ReqFilters;
  socket_filters: SocketFilters;
  armour_filters: ArmourFilters;
  weapon_filters: WeaponFilters;
}
interface Status {
  option?: string;
}
interface Name {
  discriminator?: string;
  option?: string;
}
interface Type {
  discriminator?: string;
  option?: string;
}

interface Stat {
  type: string;
  filters: Filter[];
  disabled: boolean;
  value?: {
    min?: number | null;
    weight?: number;
    option?: number | null;
  };
}

interface Filter {
  id: string;
  disabled: boolean;
  value?: {
    min?: number | null;
    weight?: number;
    option?: number | null;
  };
}

interface MiscFilters {
  filters: {
    quality?: RangeFilter;
    gem_level?: RangeFilter;
    ilvl?: RangeFilter;
    gem_level_progress?: RangeFilter;
    gem_alternate_quality?: OptionFilter;
    fractured_item?: OptionFilter;
    tangled_item?: OptionFilter;
    synthesised_item?: OptionFilter;
    crucible_item?: OptionFilter;
    corrupted?: OptionFilter;
    split?: OptionFilter;
    veiled?: OptionFilter;
    crafted?: OptionFilter;
    foreseeing?: OptionFilter;
    searing_item?: OptionFilter;
    mirrored?: OptionFilter;
    identified?: OptionFilter;
    talisman_tier?: RangeFilter;
    stack_size?: RangeFilter;
    stored_experience?: RangeFilter;
    alternate_art?: OptionFilter;
    foil_variation?: OptionFilter;
  };
  disabled: boolean;
}

interface TypeFilters {
  filters: {
    rarity?: OptionFilter;
    category?: OptionFilter;
  };
  disabled: boolean;
}

interface TradeFilters {
  filters: {
    account?: InputFilter;
    collapse?: OptionFilter;
    indexed?: OptionFilter;
    sale_type?: OptionFilter;
    price?: PriceFilter;
  };
  disabled: boolean;
}

interface SanctumFilters {
  disabled: boolean;
  filters: {
    sanctum_resolve?: RangeFilter;
    sanctum_inspiration?: RangeFilter;
    sanctum_max_resolve?: RangeFilter;
    sanctum_gold?: RangeFilter;
  };
}

interface HeistFilters {
  disabled: boolean;
  filters: {
    heist_wings?: RangeFilter;
    heist_reward_rooms?: RangeFilter;
    heist_escape_routes?: RangeFilter;
    heist_max_wings?: RangeFilter;
    heist_max_reward_rooms?: RangeFilter;
    heist_max_escape_routes?: RangeFilter;
    heist_objective_value?: OptionFilter;
    heist_lockpicking?: RangeFilter;
    heist_counter_thaumaturgy?: RangeFilter;
    heist_engineering?: RangeFilter;
    heist_agility?: RangeFilter;
    heist_demolition?: RangeFilter;
    heist_deception?: RangeFilter;
    heist_brute_force?: RangeFilter;
    heist_trap_disarmament?: RangeFilter;
    heist_perception?: RangeFilter;
  };
}

interface MapFilters {
  disabled: boolean;
  filters: {
    map_tier?: RangeFilter;
    map_iiq?: RangeFilter;
    area_level?: RangeFilter;
    map_iir?: RangeFilter;
    map_packsize?: RangeFilter;
    map_blighted?: OptionFilter;
    map_series?: OptionFilter;
    map_uberblighted?: OptionFilter;
  };
}

interface ReqFilters {
  disabled: boolean;
  filters: {
    lvl?: RangeFilter;
    dex?: RangeFilter;
    class?: OptionFilter;
    int?: RangeFilter;
    str?: RangeFilter;
  };
}

interface SocketFilters {
  disabled: boolean;
  filters: {
    sockets?: SocketsFilter;
    links?: LinksFilter;
  };
}

interface ArmourFilters {
  disabled: boolean;
  filters: {
    ar?: RangeFilter;
    es?: RangeFilter;
    block?: RangeFilter;
    ward?: RangeFilter;
    base_defence_percentile?: RangeFilter;
    ev?: RangeFilter;
  };
}

interface WeaponFilters {
  disabled: boolean;
  filters: {
    damage?: RangeFilter;
    crit?: RangeFilter;
    pdps?: RangeFilter;
    aps?: RangeFilter;
    dps?: RangeFilter;
    edps?: RangeFilter;
  };
}

interface RangeFilter {
  min?: number | null;
  max?: number | null;
}

interface OptionFilter {
  option?: string | null;
}

interface InputFilter {
  input?: string | null;
}

interface PriceFilter {
  option?: string | null;
  min?: number | null;
  max?: number | null;
}

interface SocketsFilter {
  r?: number | null;
  g?: number | null;
  min?: number | null;
  max?: number | null;
  w?: number | null;
  b?: number | null;
}

interface LinksFilter {
  g?: number | null;
  r?: number | null;
  b?: number | null;
  w?: number | null;
  min?: number | null;
  max?: number | null;
}
