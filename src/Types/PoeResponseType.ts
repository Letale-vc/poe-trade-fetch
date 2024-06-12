import { z } from "zod";

export const poeFirstResponseTypeSchema = z.object({
    id: z.string(),
    complexity: z.number(),
    result: z.array(z.string()),
    total: z.number(),
});

export const responseLeagueListTypeSchema = z.object({
    result: z.array(
        z.object({
            id: z.string(),
            realm: z.string(),
            text: z.string(),
        }),
    ),
});

export const poeTradeDataItemsResultTypeSchema = z.object({
    id: z.string(),
    label: z.string(),
    entries: z.array(
        z.object({
            name: z.string().optional(),
            type: z.string(),
            text: z.string(),
            flags: z
                .object({
                    unique: z.boolean().optional(),
                })
                .optional(),
        }),
    ),
});

export const poeTradeDataItemsResponseTypeSchema = z.object({
    result: z.array(poeTradeDataItemsResultTypeSchema),
});

const itemPropertyTypeSchema = z.object({
    name: z.string(),
    values: z.tuple([z.tuple([z.string(), z.number()])]),
    displayMode: z.number(),
    type: z.number().optional(),
    progress: z.number().optional(),
    suffix: z.string().optional(),
});

const itemSocketTypeSchema = z.object({
    group: z.number(),
    attr: z.union([
        z.literal("S"),
        z.literal("D"),
        z.literal("I"),
        z.literal("G"),
        z.literal("A"),
        z.literal("DV"),
    ]),
    sColour: z.union([
        z.literal("R"),
        z.literal("G"),
        z.literal("B"),
        z.literal("W"),
        z.literal("A"),
        z.literal("DV"),
    ]),
});

export const itemTypeSchema = z.object({
    verified: z.boolean(),
    w: z.number(),
    h: z.number(),
    icon: z.string(),
    support: z.boolean().optional(),
    stackSize: z.number().optional(),
    maxStackSize: z.number().optional(),
    stackSizeText: z.string().optional(),
    league: z.string().optional(),
    id: z.string().optional(),
    influences: z.any().optional(),
    elder: z.literal(true).optional(),
    shaper: z.literal(true).optional(),
    searing: z.literal(true).optional(),
    tangled: z.literal(true).optional(),
    abyssJewel: z.literal(true).optional(),
    delve: z.literal(true).optional(),
    fractured: z.literal(true).optional(),
    synthesised: z.literal(true).optional(),
    name: z.string(),
    sockets: z.array(itemSocketTypeSchema).optional(),
    typeLine: z.string(),
    baseType: z.string(),
    identified: z.boolean(),
    itemLevel: z.number().optional(),
    ilvl: z.number(),
    note: z.string().optional(),
    forum_note: z.string().optional(),
    lockedToCharacter: z.literal(true).optional(),
    lockedToAccount: z.literal(true).optional(),
    duplicated: z.literal(true).optional(),
    split: z.literal(true).optional(),
    corrupted: z.literal(true).optional(),
    unmodifiable: z.literal(true).optional(),
    cisRaceReward: z.literal(true).optional(),
    seaRaceReward: z.literal(true).optional(),
    thRaceReward: z.literal(true).optional(),
    properties: z.array(itemPropertyTypeSchema).optional(),
    notableProperties: z.array(itemPropertyTypeSchema).optional(),
    requirements: z.array(itemPropertyTypeSchema).optional(),
    additionalProperties: z.array(itemPropertyTypeSchema).optional(),
    nextLevelRequirements: z.array(itemPropertyTypeSchema).optional(),
    talismanTier: z.number().optional(),
    secDescrText: z.string().optional(),
    utilityMods: z.array(z.string()).optional(),
    logbookMods: z
        .array(
            z.object({
                name: z.string(),
                faction: z.object({
                    id: z.string(),
                    name: z.string(),
                }),
                mods: z.array(z.string()),
            }),
        )
        .optional(),
    enchantMods: z.array(z.string()).optional(),
    scourgeMods: z.array(z.string()).optional(),
    implicitMods: z.array(z.string()).optional(),
    ultimatumMods: z
        .array(
            z.object({
                type: z.string(),
                tier: z.number(),
            }),
        )
        .optional(),
    explicitMods: z.array(z.string()).optional(),
    craftedMods: z.array(z.string()).optional(),
    fracturedMods: z.array(z.string()).optional(),
    cosmeticMods: z.array(z.string()).optional(),
    veiledMods: z.array(z.string()).optional(),
    veiled: z.literal(true).optional(),
    descrText: z.string().optional(),
    flavourText: z.array(z.string()).optional(),
    flavourTextParsed: z.array(z.string()).optional(),
    prophecyText: z.string().optional(),
    isRelic: z.literal(true).optional(),
    replica: z.literal(true).optional(),
    incubatedItem: z
        .object({
            name: z.string(),
            level: z.number(),
            progress: z.number(),
            total: z.number(),
        })
        .optional(),
    scourged: z
        .object({
            tier: z.number(),
            level: z.number().optional(),
            progress: z.number().optional(),
            total: z.number().optional(),
        })
        .optional(),
    frameType: z.number().optional(),
    artFilename: z.string().optional(),
    hybrid: z
        .object({
            isVaalGem: z.boolean().optional(),
            baseTypeName: z.string().optional(),
            properties: z.array(itemPropertyTypeSchema).optional(),
        })
        .optional(),
    extended: z
        .object({
            dps: z.literal(139.01).optional(),
            pdps: z.literal(108.51).optional(),
            edps: z.literal(30.5).optional(),
            dps_aug: z.literal(true).optional(),
            pdps_aug: z.literal(true).optional(),
            mods: z
                .object({
                    explicit: z.array(
                        z.object({
                            name: z.string(),
                            tier: z.string(),
                            level: z.number(),
                            magnitudes: z.tuple([
                                z.object({
                                    hash: z.string(),
                                    min: z.number(),
                                    max: z.number(),
                                }),
                            ]),
                        }),
                    ),
                })
                .optional(),
            hashes: z.object({
                explicit: z.array(
                    z.array(z.union([z.string(), z.array(z.number())])),
                ),
            }),
            category: z.string().optional(),
            subcategories: z.array(z.string()).optional(),
            prefixes: z.number().optional(),
            suffixes: z.number().optional(),
            text: z.string(),
        })
        .optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    inventoryId: z.string(),
    socket: z.number(),
    colour: z.string().optional(),
});

export const poeSecondResultTypeSchema = z.object({
    id: z.string(),
    listing: z.object({
        method: z.literal("psapi"),
        indexed: z.date(),
        stash: z.object({
            name: z.string(),
            x: z.number(),
            y: z.number(),
        }),
        whisper: z.string(),
        whisper_token: z.string(),
        account: z.object({
            name: z.string(),
            lastCharacterName: z.string(),
            online: z.object({
                league: z.string(),
            }),
            language: z.string(),
            realm: z.string(),
        }),
        price: z.object({
            type: z.string(),
            amount: z.number(),
            currency: z.string(),
        }),
    }),
    item: itemTypeSchema,
});

export const poeSecondResponseTypeSchema = z.object({
    result: z.array(poeSecondResultTypeSchema),
});

// inferred types:
export type PoeFirstResponseType = z.infer<typeof poeFirstResponseTypeSchema>;

export type ResponseLeagueListType = z.infer<
    typeof responseLeagueListTypeSchema
>;

export type PoeTradeDataItemsResultType = z.infer<
    typeof poeTradeDataItemsResultTypeSchema
>;

export type PoeTradeDataItemsResponseType = z.infer<
    typeof poeTradeDataItemsResponseTypeSchema
>;

export type ItemType = z.infer<typeof itemTypeSchema>;

export type PoeSecondResultType = z.infer<typeof poeSecondResultTypeSchema>;

export type PoeSecondResponseType = z.infer<typeof poeSecondResponseTypeSchema>;
