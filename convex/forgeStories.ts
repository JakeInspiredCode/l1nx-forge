import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("forgeStories").collect();
  },
});

export const upsert = mutation({
  args: {
    storyId: v.string(),
    question: v.string(),
    framework: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("forgeStories")
      .withIndex("by_storyId", (q) => q.eq("storyId", args.storyId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("forgeStories", args);
  },
});
