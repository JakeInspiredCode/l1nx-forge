import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("forgeReviews").collect();
  },
});

export const getByCard = query({
  args: { cardId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forgeReviews")
      .withIndex("by_card", (q) => q.eq("cardId", args.cardId))
      .collect();
  },
});

export const add = mutation({
  args: {
    cardId: v.string(),
    timestamp: v.string(),
    quality: v.number(),
    responseTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("forgeReviews", args);
  },
});
