import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByScenario = query({
  args: { scenarioId: v.string() },
  handler: async (ctx, { scenarioId }) => {
    return ctx.db
      .query("forgeDiagnosisHistory")
      .withIndex("by_scenarioId", (q) => q.eq("scenarioId", scenarioId))
      .collect();
  },
});

export const getBestByScenario = query({
  args: { scenarioId: v.string() },
  handler: async (ctx, { scenarioId }) => {
    const records = await ctx.db
      .query("forgeDiagnosisHistory")
      .withIndex("by_scenarioId", (q) => q.eq("scenarioId", scenarioId))
      .collect();
    if (records.length === 0) return null;
    return records.reduce((best, r) => (r.score > best.score ? r : best));
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const results = await ctx.db
      .query("forgeDiagnosisHistory")
      .withIndex("by_completedAt")
      .order("desc")
      .collect();
    return results.slice(0, limit ?? 20);
  },
});

export const add = mutation({
  args: {
    scenarioId: v.string(),
    difficulty: v.string(),
    score: v.number(),
    stepsCompleted: v.number(),
    totalSteps: v.number(),
    xpEarned: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("forgeDiagnosisHistory", {
      ...args,
      completedAt: new Date().toISOString(),
    });
  },
});
