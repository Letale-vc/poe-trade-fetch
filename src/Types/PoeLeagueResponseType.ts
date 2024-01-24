import {z} from "zod";

export const leagueCategorySchema = z.object({
  id: z.string(),
  current: z.boolean().optional(),
});

export const leagueRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const leagueTypeSchema = z.object({
  id: z.string(),
  realm: z.string(),
  url: z.string(),
  startAt: z.string().nullable(),
  endAt: z.string().nullable(),
  description: z.string(),
  category: leagueCategorySchema,
  registerAt: z.string().nullable(),
  delveEvent: z.boolean().optional(),
  rules: z.array(leagueRuleSchema),
  event: z.boolean().optional(),
});

export const leagueResponseTypeSchema = z.array(leagueTypeSchema);

// inferred types:
export type LeagueCategory = z.infer<typeof leagueCategorySchema>;

export type LeagueRule = z.infer<typeof leagueRuleSchema>;

export type LeagueType = z.infer<typeof leagueTypeSchema>;

export type LeagueResponseType = z.infer<typeof leagueResponseTypeSchema>;
