import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    timestamp: v.string(),
    topicId: v.string(),
    cardTypeFilter: v.array(v.string()),
    startingTime: v.number(),
    totalCards: v.number(),
    correctCards: v.number(),
    partialCards: v.number(),
    wrongCards: v.number(),
    totalPoints: v.number(),
    bestStreak: v.number(),
    avgResponseMs: v.number(),
    cardResults: v.array(v.object({
      cardId: v.string(),
      result: v.string(),
      userInput: v.string(),
      responseMs: v.number(),
      feedback: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("forgeSpeedRuns", args);
  },
});

// High scores for a given topic + card type filter combo
export const getHistory = query({
  args: {
    topicId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("forgeSpeedRuns");
    const runs = await q.collect();
    const filtered = args.topicId
      ? runs.filter((r) => r.topicId === args.topicId)
      : runs;
    // Sort by points descending
    filtered.sort((a, b) => b.totalPoints - a.totalPoints);
    return filtered.slice(0, args.limit ?? 10);
  },
});

export const getBestScore = query({
  args: {
    topicId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const runs = await ctx.db.query("forgeSpeedRuns").collect();
    const filtered = args.topicId
      ? runs.filter((r) => r.topicId === args.topicId)
      : runs;
    if (filtered.length === 0) return null;
    return filtered.reduce((best, r) => r.totalPoints > best.totalPoints ? r : best);
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("forgeSpeedRuns")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 5);
    return runs;
  },
});
