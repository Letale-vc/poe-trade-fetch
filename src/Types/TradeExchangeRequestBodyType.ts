import { z } from "zod";

export const sortSchema = z.object({
    have: z.string(),
});

export const statusSchema = z.object({
    option: z.string(),
});

export const exchangeQuerySchema = z.object({
    status: z.union([statusSchema, z.string()]).optional(),
    have: z.array(z.string()).optional(),
    want: z.array(z.string()).optional(),
    minimum: z.number().optional(),
    collapse: z.boolean().optional(),
    account: z.string().optional(),
    fulfillable: z.null().optional(),
});

export const tradeExchangeRequestTypeSchema = z.object({
    query: exchangeQuerySchema,
    sort: sortSchema.optional(),
    engine: z.literal("new").optional(),
});

export type Sort = z.infer<typeof sortSchema>;

export type Status = z.infer<typeof statusSchema>;

export type ExchangeQuery = z.infer<typeof exchangeQuerySchema>;

export type TradeExchangeRequestType = z.infer<
    typeof tradeExchangeRequestTypeSchema
>;
