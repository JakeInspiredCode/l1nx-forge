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
    const maxResults = args.limit ?? 10;
    if (args.topicId) {
      // Use topic index, then sort client-side (bounded by topic)
      const runs = await ctx.db
        .query("forgeSpeedRuns")
        .withIndex("by_topic", (q) => q.eq("topicId", args.topicId!))
        .collect();
      runs.sort((a, b) => b.totalPoints - a.totalPoints);
      return runs.slice(0, maxResults);
    }
    // No topic: get top scores using points index
    return await ctx.db
      .query("forgeSpeedRuns")
      .withIndex("by_points")
      .order("desc")
      .take(maxResults);
  },
});

export const getBestScore = query({
  args: {
    topicId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.topicId) {
      const runs = await ctx.db
        .query("forgeSpeedRuns")
        .withIndex("by_topic", (q) => q.eq("topicId", args.topicId!))
        .collect();
      if (runs.length === 0) return null;
      return runs.reduce((best, r) => r.totalPoints > best.totalPoints ? r : best);
    }
    // Global best: use points index
    return await ctx.db
      .query("forgeSpeedRuns")
      .withIndex("by_points")
      .order("desc")
      .first();
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
