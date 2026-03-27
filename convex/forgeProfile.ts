import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();
  },
});

export const upsert = mutation({
  args: {
    streak: v.number(),
    lastSessionDate: v.string(),
    totalPoints: v.number(),
    badges: v.array(v.string()),
    totalSessionMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("forgeProfile", {
      profileId: "default",
      ...args,
    });
  },
});

export const addPoints = mutation({
  args: { points: v.number() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();
    if (!profile) {
      return await ctx.db.insert("forgeProfile", {
        profileId: "default",
        streak: 0,
        lastSessionDate: "",
        totalPoints: args.points,
        badges: [],
        totalSessionMinutes: 0,
      });
    }
    const multiplier = profile.streak >= 3 ? 2 : 1;
    await ctx.db.patch(profile._id, {
      totalPoints: profile.totalPoints + args.points * multiplier,
    });
    return profile._id;
  },
});
