import { z } from "zod";

export const onlineTypeSchema = z.object({
    league: z.string(),
});

export const offerExchangeTypeSchema = z.object({
    currency: z.string(),
    amount: z.number(),
    whisper: z.string(),
});

export const OfferItemTypeSchema = z.object({
    currency: z.string(),
    amount: z.number(),
    stock: z.number(),
    id: z.string(),
    whisper: z.string(),
});

export const accountTypeSchema = z.object({
    name: z.string(),
    online: onlineTypeSchema,
    lastCharacterName: z.string(),
    language: z.string(),
    realm: z.string(),
});

export const offerTypeSchema = z.object({
    exchange: offerExchangeTypeSchema,
    item: OfferItemTypeSchema,
});

export const listingTypeSchema = z.object({
    indexed: z.string(),
    account: accountTypeSchema,
    offers: z.array(offerTypeSchema),
    whisper: z.string(),
    whisper_token: z.string(),
});

export const listingItemInfoTypeSchema = z.object({
    id: z.string(),
    item: z.null(),
    listing: listingTypeSchema,
});

export const resultTypeSchema = z.record(listingItemInfoTypeSchema);

export const exchangeResponseTypeSchema = z.object({
    id: z.string(),
    complexity: z.null(),
    result: resultTypeSchema,
    total: z.number(),
});

// inferred types:
export type OnlineType = z.infer<typeof onlineTypeSchema>;

export type OfferExchangeType = z.infer<typeof offerExchangeTypeSchema>;

export type OfferItemType = z.infer<typeof OfferItemTypeSchema>;

export type AccountType = z.infer<typeof accountTypeSchema>;

export type OfferType = z.infer<typeof offerTypeSchema>;

export type ListingType = z.infer<typeof listingTypeSchema>;

export type ListingItemInfoType = z.infer<typeof listingItemInfoTypeSchema>;

export type ResultType = z.infer<typeof resultTypeSchema>;

export type ExchangeResponseType = z.infer<typeof exchangeResponseTypeSchema>;
