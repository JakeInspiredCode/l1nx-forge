import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("forgeProgress").collect();
  },
});

export const getByTopic = query({
  args: { topicId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forgeProgress")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    topicId: v.string(),
    masteryPercent: v.number(),
    currentTier: v.number(),
    tierProgress: v.object({
      tier1: v.object({ total: v.number(), qualified: v.number() }),
      tier2: v.object({ total: v.number(), qualified: v.number() }),
      tier3: v.object({ total: v.number(), qualified: v.number() }),
      tier4: v.object({ total: v.number(), qualified: v.number() }),
    }),
    totalCards: v.number(),
    masteredCards: v.number(),
    learningCards: v.number(),
    newCards: v.number(),
    weakFlag: v.boolean(),
    lastUpdated: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("forgeProgress")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("forgeProgress", args);
  },
});
