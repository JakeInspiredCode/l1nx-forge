import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forgeSessions")
      .withIndex("by_startTime")
      .order("desc")
      .take(args.limit ?? 500);
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("forgeSessions")
      .withIndex("by_startTime")
      .order("desc")
      .take(args.limit ?? 10);
    return sessions;
  },
});

export const add = mutation({
  args: {
    type: v.string(),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    cardIds: v.array(v.string()),
    answers: v.array(v.object({
      cardId: v.string(),
      transcript: v.string(),
      rubricScores: v.object({
        technical: v.number(),
        structure: v.number(),
        ownership: v.number(),
      }),
      missedTerms: v.array(v.string()),
    })),
    overallScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("forgeSessions", args);
  },
});
