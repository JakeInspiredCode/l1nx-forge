import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──

export const getBountyHistory = query({
  args: { bountyId: v.string() },
  handler: async (ctx, { bountyId }) => {
    return ctx.db
      .query("forgeBountyHistory")
      .withIndex("by_bountyId", (q) => q.eq("bountyId", bountyId))
      .collect();
  },
});

export const getRecentBounties = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const results = await ctx.db
      .query("forgeBountyHistory")
      .withIndex("by_completedAt")
      .order("desc")
      .collect();
    return results.slice(0, limit ?? 20);
  },
});

export const getAllBountyHistory = query({
  handler: async (ctx) => {
    return ctx.db.query("forgeBountyHistory").collect();
  },
});

export const getBestBountyScore = query({
  args: { bountyId: v.string() },
  handler: async (ctx, { bountyId }) => {
    const records = await ctx.db
      .query("forgeBountyHistory")
      .withIndex("by_bountyId", (q) => q.eq("bountyId", bountyId))
      .collect();
    if (records.length === 0) return null;
    return records.reduce((best, r) => (r.score > best.score ? r : best));
  },
});

// ── Mutations ──

export const completeBounty = mutation({
  args: {
    bountyId: v.string(),
    score: v.number(),
    xpEarned: v.number(),
  },
  handler: async (ctx, { bountyId, score, xpEarned }) => {
    return ctx.db.insert("forgeBountyHistory", {
      bountyId,
      completedAt: new Date().toISOString(),
      score,
      xpEarned,
    });
  },
});
