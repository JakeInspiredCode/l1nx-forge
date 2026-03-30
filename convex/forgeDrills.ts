import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("forgeDrills").collect();
  },
});

export const getByScenario = query({
  args: { scenarioId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forgeDrills")
      .withIndex("by_scenario", (q) => q.eq("scenarioId", args.scenarioId))
      .collect();
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("forgeDrills")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 10);
    return results;
  },
});

export const getBestByScenario = query({
  args: { scenarioId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("forgeDrills")
      .withIndex("by_scenario", (q) => q.eq("scenarioId", args.scenarioId))
      .collect();
    if (results.length === 0) return null;
    return results.reduce((best, r) =>
      r.overallTermHitRate > best.overallTermHitRate ? r : best
    );
  },
});

export const add = mutation({
  args: {
    scenarioId: v.string(),
    timestamp: v.string(),
    totalSteps: v.number(),
    completedSteps: v.number(),
    steps: v.array(v.object({
      stepIndex: v.number(),
      userResponse: v.string(),
      matchedTerms: v.array(v.string()),
      totalTerms: v.number(),
      usedHints: v.boolean(),
    })),
    overallTermHitRate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("forgeDrills", args);
  },
});
