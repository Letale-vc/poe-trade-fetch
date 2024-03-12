import {z} from "zod";

export const sortTypeSchema = z.record(z.string());

const statusTypeSchema = z.object({
  option: z.string().optional(),
});

const nameTypeSchema = z.object({
  discriminator: z.string().optional(),
  option: z.string().optional(),
});

const typeTypeSchema = z.object({
  discriminator: z.string().optional(),
  option: z.string().optional(),
});

const filterTypeSchema = z.object({
  id: z.string().optional(),
  disabled: z.boolean().optional(),
  value: z
    .object({
      min: z.number().optional().nullable(),
      weight: z.number().optional(),
      option: z.number().optional().nullable(),
    })
    .optional(),
});

const rangeFilterTypeSchema = z.object({
  min: z.number().optional().nullable(),
  max: z.number().optional().nullable(),
});

const optionFilterTypeSchema = z.object({
  option: z.string().optional().nullable(),
});

const inputFilterTypeSchema = z.object({
  input: z
    .enum([
      "1hour",
      "3hours",
      "12hours",
      "1day",
      "3days",
      "1week",
      "2weeks",
      "1month",
      "2months",
    ])
    .optional()
    .nullable(),
});

const priceFilterTypeSchema = z.object({
  option: z.string().optional().nullable(),
  min: z.number().optional().nullable(),
  max: z.number().optional().nullable(),
});

const socketsFilterTypeSchema = z.object({
  r: z.number().optional().nullable(),
  g: z.number().optional().nullable(),
  min: z.number().optional().nullable(),
  max: z.number().optional().nullable(),
  w: z.number().optional().nullable(),
  b: z.number().optional().nullable(),
});

const linksFilterTypeSchema = z.object({
  g: z.number().optional().nullable(),
  r: z.number().optional().nullable(),
  b: z.number().optional().nullable(),
  w: z.number().optional().nullable(),
  min: z.number().optional().nullable(),
  max: z.number().optional().nullable(),
});

const statTypeSchema = z.object({
  type: z.string().optional(),
  filters: z.array(filterTypeSchema).optional(),
  disabled: z.boolean().optional(),
  value: z
    .object({
      min: z.number().optional().nullable(),
      weight: z.number().optional(),
      option: z.number().optional().nullable(),
    })
    .optional(),
});

const miscFiltersTypeSchema = z.object({
  filters: z
    .object({
      quality: rangeFilterTypeSchema.optional(),
      gem_level: rangeFilterTypeSchema.optional(),
      ilvl: rangeFilterTypeSchema.optional(),
      gem_level_progress: rangeFilterTypeSchema.optional(),
      gem_alternate_quality: optionFilterTypeSchema.optional(),
      fractured_item: optionFilterTypeSchema.optional(),
      tangled_item: optionFilterTypeSchema.optional(),
      synthesised_item: optionFilterTypeSchema.optional(),
      crucible_item: optionFilterTypeSchema.optional(),
      corrupted: optionFilterTypeSchema.optional(),
      split: optionFilterTypeSchema.optional(),
      veiled: optionFilterTypeSchema.optional(),
      crafted: optionFilterTypeSchema.optional(),
      foreseeing: optionFilterTypeSchema.optional(),
      searing_item: optionFilterTypeSchema.optional(),
      mirrored: optionFilterTypeSchema.optional(),
      identified: optionFilterTypeSchema.optional(),
      talisman_tier: rangeFilterTypeSchema.optional(),
      stack_size: rangeFilterTypeSchema.optional(),
      stored_experience: rangeFilterTypeSchema.optional(),
      alternate_art: optionFilterTypeSchema.optional(),
      foil_variation: optionFilterTypeSchema.optional(),
    })
    .optional(),
  disabled: z.boolean().optional(),
});

const typeFiltersTypeSchema = z.object({
  filters: z
    .object({
      rarity: optionFilterTypeSchema.optional(),
      category: optionFilterTypeSchema.optional(),
    })
    .optional(),
  disabled: z.boolean().optional(),
});

const tradeFiltersTypeSchema = z.object({
  filters: z
    .object({
      account: inputFilterTypeSchema.optional(),
      collapse: optionFilterTypeSchema.optional(),
      indexed: optionFilterTypeSchema.optional(),
      sale_type: optionFilterTypeSchema.optional(),
      price: priceFilterTypeSchema.optional(),
    })
    .optional(),
  disabled: z.boolean().optional(),
});

const sanctumFiltersTypeSchema = z.object({
  disabled: z.boolean().optional(),
  filters: z
    .object({
      sanctum_resolve: rangeFilterTypeSchema.optional(),
      sanctum_inspiration: rangeFilterTypeSchema.optional(),
      sanctum_max_resolve: rangeFilterTypeSchema.optional(),
      sanctum_gold: rangeFilterTypeSchema.optional(),
    })
    .optional(),
});

const heistFiltersTypeSchema = z.object({
  disabled: z.boolean().optional(),
  filters: z
    .object({
      heist_wings: rangeFilterTypeSchema.optional(),
      heist_reward_rooms: rangeFilterTypeSchema.optional(),
      heist_escape_routes: rangeFilterTypeSchema.optional(),
      heist_max_wings: rangeFilterTypeSchema.optional(),
      heist_max_reward_rooms: rangeFilterTypeSchema.optional(),
      heist_max_escape_routes: rangeFilterTypeSchema.optional(),
      heist_objective_value: optionFilterTypeSchema.optional(),
      heist_lockpicking: rangeFilterTypeSchema.optional(),
      heist_counter_thaumaturgy: rangeFilterTypeSchema.optional(),
      heist_engineering: rangeFilterTypeSchema.optional(),
      heist_agility: rangeFilterTypeSchema.optional(),
      heist_demolition: rangeFilterTypeSchema.optional(),
      heist_deception: rangeFilterTypeSchema.optional(),
      heist_brute_force: rangeFilterTypeSchema.optional(),
      heist_trap_disarmament: rangeFilterTypeSchema.optional(),
      heist_perception: rangeFilterTypeSchema.optional(),
    })
    .optional(),
});

const mapFiltersTypeSchema = z.object({
  disabled: z.boolean().optional(),
  filters: z
    .object({
      map_tier: rangeFilterTypeSchema.optional(),
      map_iiq: rangeFilterTypeSchema.optional(),
      area_level: rangeFilterTypeSchema.optional(),
      map_iir: rangeFilterTypeSchema.optional(),
      map_packsize: rangeFilterTypeSchema.optional(),
      map_blighted: optionFilterTypeSchema.optional(),
      map_series: optionFilterTypeSchema.optional(),
      map_uberblighted: optionFilterTypeSchema.optional(),
    })
    .optional(),
});

const reqFiltersTypeSchema = z.object({
  disabled: z.boolean().optional(),
  filters: z
    .object({
      lvl: rangeFilterTypeSchema.optional(),
      dex: rangeFilterTypeSchema.optional(),
      class: optionFilterTypeSchema.optional(),
      int: rangeFilterTypeSchema.optional(),
      str: rangeFilterTypeSchema.optional(),
    })
    .optional(),
});

const socketFiltersTypeSchema = z.object({
  disabled: z.boolean().optional(),
  filters: z
    .object({
      sockets: socketsFilterTypeSchema.optional(),
      links: linksFilterTypeSchema.optional(),
    })
    .optional(),
});

const armourFiltersTypeSchema = z.object({
  disabled: z.boolean().optional(),
  filters: z
    .object({
      ar: rangeFilterTypeSchema.optional(),
      es: rangeFilterTypeSchema.optional(),
      block: rangeFilterTypeSchema.optional(),
      ward: rangeFilterTypeSchema.optional(),
      base_defence_percentile: rangeFilterTypeSchema.optional(),
      ev: rangeFilterTypeSchema.optional(),
    })
    .optional(),
});

const weaponFiltersTypeSchema = z.object({
  disabled: z.boolean().optional(),
  filters: z
    .object({
      damage: rangeFilterTypeSchema.optional(),
      crit: rangeFilterTypeSchema.optional(),
      pdps: rangeFilterTypeSchema.optional(),
      aps: rangeFilterTypeSchema.optional(),
      dps: rangeFilterTypeSchema.optional(),
      edps: rangeFilterTypeSchema.optional(),
    })
    .optional(),
});

const filtersTypeSchema = z.object({
  misc_filters: miscFiltersTypeSchema.optional(),
  type_filters: typeFiltersTypeSchema.optional(),
  trade_filters: tradeFiltersTypeSchema.optional(),
  sanctum_filters: sanctumFiltersTypeSchema.optional(),
  heist_filters: heistFiltersTypeSchema.optional(),
  map_filters: mapFiltersTypeSchema.optional(),
  req_filters: reqFiltersTypeSchema.optional(),
  socket_filters: socketFiltersTypeSchema.optional(),
  armour_filters: armourFiltersTypeSchema.optional(),
  weapon_filters: weaponFiltersTypeSchema.optional(),
});

export const queryTypeSchema = z.object({
  status: z.union([statusTypeSchema, z.string()]).optional(),
  name: z.union([z.string(), nameTypeSchema]).optional(),
  type: z.union([z.string(), typeTypeSchema]).optional(),
  term: z.string().optional(),
  stats: z.array(statTypeSchema).optional(),
  filters: filtersTypeSchema.optional(),
});

export const requestBodyTypeSchema = z.object({
  query: queryTypeSchema,
  sort: sortTypeSchema.optional(),
});

// inferred types:
export type SortType = z.infer<typeof sortTypeSchema>;

export type QueryType = z.infer<typeof queryTypeSchema>;

export type RequestBodyType = z.infer<typeof requestBodyTypeSchema>;
