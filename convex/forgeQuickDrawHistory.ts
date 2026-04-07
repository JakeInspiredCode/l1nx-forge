import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByModule = query({
  args: { moduleId: v.string() },
  handler: async (ctx, { moduleId }) => {
    return ctx.db
      .query("forgeQuickDrawHistory")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
      .collect();
  },
});

export const getBestByModule = query({
  args: { moduleId: v.string() },
  handler: async (ctx, { moduleId }) => {
    const records = await ctx.db
      .query("forgeQuickDrawHistory")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
      .collect();
    if (records.length === 0) return null;
    return records.reduce((best, r) => (r.score > best.score ? r : best));
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const results = await ctx.db
      .query("forgeQuickDrawHistory")
      .withIndex("by_completedAt")
      .order("desc")
      .collect();
    return results.slice(0, limit ?? 20);
  },
});

export const add = mutation({
  args: {
    moduleId: v.string(),
    score: v.number(),
    totalItems: v.number(),
    correctItems: v.number(),
    timeMs: v.number(),
    xpEarned: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("forgeQuickDrawHistory", {
      ...args,
      completedAt: new Date().toISOString(),
    });
  },
});
