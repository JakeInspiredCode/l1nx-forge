import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──

export const getCampaignState = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return ctx.db
      .query("forgeCampaignProgress")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();
  },
});

export const getAllCampaignStates = query({
  handler: async (ctx) => {
    return ctx.db.query("forgeCampaignProgress").collect();
  },
});

export const getEnrolledCampaigns = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("forgeCampaignProgress").collect();
    return all.filter((c) => c.enrolled);
  },
});

// ── Mutations ──

export const enrollCampaign = mutation({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const existing = await ctx.db
      .query("forgeCampaignProgress")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    const now = new Date().toISOString();

    if (existing) {
      await ctx.db.patch(existing._id, {
        enrolled: true,
        enrolledAt: now,
        lastActivityAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("forgeCampaignProgress", {
      campaignId,
      enrolled: true,
      enrolledAt: now,
      currentMissionIndex: 0,
      completedMissions: [],
      lastActivityAt: now,
    });
  },
});

export const advanceMission = mutation({
  args: {
    campaignId: v.string(),
    completedMissionId: v.string(),
  },
  handler: async (ctx, { campaignId, completedMissionId }) => {
    const state = await ctx.db
      .query("forgeCampaignProgress")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!state) throw new Error(`No campaign state for ${campaignId}`);

    const completed = state.completedMissions.includes(completedMissionId)
      ? state.completedMissions
      : [...state.completedMissions, completedMissionId];

    await ctx.db.patch(state._id, {
      completedMissions: completed,
      currentMissionIndex: completed.length,
      lastActivityAt: new Date().toISOString(),
    });
  },
});

export const unenrollCampaign = mutation({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const state = await ctx.db
      .query("forgeCampaignProgress")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (state) {
      await ctx.db.patch(state._id, { enrolled: false });
    }
  },
});
