import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──

export const getMissionState = query({
  args: { missionId: v.string() },
  handler: async (ctx, { missionId }) => {
    return ctx.db
      .query("forgeMissionProgress")
      .withIndex("by_missionId", (q) => q.eq("missionId", missionId))
      .first();
  },
});

export const getAllMissionStates = query({
  handler: async (ctx) => {
    return ctx.db.query("forgeMissionProgress").collect();
  },
});

export const getMissionsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return ctx.db
      .query("forgeMissionProgress")
      .withIndex("by_status", (q) => q.eq("status", status))
      .collect();
  },
});

// ── Mutations ──

export const initMissionState = mutation({
  args: {
    missionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, { missionId, status }) => {
    const existing = await ctx.db
      .query("forgeMissionProgress")
      .withIndex("by_missionId", (q) => q.eq("missionId", missionId))
      .first();

    if (existing) return existing._id;

    return ctx.db.insert("forgeMissionProgress", {
      missionId,
      status,
      stepsCompleted: [],
      knowledgeCheckPassed: false,
      xpEarned: 0,
    });
  },
});

export const updateMissionStatus = mutation({
  args: {
    missionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, { missionId, status }) => {
    const state = await ctx.db
      .query("forgeMissionProgress")
      .withIndex("by_missionId", (q) => q.eq("missionId", missionId))
      .first();

    if (!state) throw new Error(`No mission state for ${missionId}`);
    await ctx.db.patch(state._id, { status });
  },
});

export const completeMissionStep = mutation({
  args: {
    missionId: v.string(),
    stepId: v.string(),
  },
  handler: async (ctx, { missionId, stepId }) => {
    const state = await ctx.db
      .query("forgeMissionProgress")
      .withIndex("by_missionId", (q) => q.eq("missionId", missionId))
      .first();

    if (!state) throw new Error(`No mission state for ${missionId}`);

    if (!state.stepsCompleted.includes(stepId)) {
      await ctx.db.patch(state._id, {
        stepsCompleted: [...state.stepsCompleted, stepId],
      });
    }
  },
});

export const updateLoadout = mutation({
  args: {
    missionId: v.string(),
    customLoadout: v.array(v.object({
      id: v.string(),
      type: v.string(),
      label: v.string(),
      description: v.string(),
      estimatedMinutes: v.number(),
      required: v.boolean(),
      contentRef: v.object({
        kind: v.string(),
        id: v.string(),
        params: v.optional(v.any()),
      }),
    })),
  },
  handler: async (ctx, { missionId, customLoadout }) => {
    const state = await ctx.db
      .query("forgeMissionProgress")
      .withIndex("by_missionId", (q) => q.eq("missionId", missionId))
      .first();

    if (!state) throw new Error(`No mission state for ${missionId}`);
    await ctx.db.patch(state._id, { customLoadout });
  },
});

export const submitKnowledgeCheck = mutation({
  args: {
    missionId: v.string(),
    score: v.number(),
    passed: v.boolean(),
    xpEarned: v.number(),
  },
  handler: async (ctx, { missionId, score, passed, xpEarned }) => {
    const state = await ctx.db
      .query("forgeMissionProgress")
      .withIndex("by_missionId", (q) => q.eq("missionId", missionId))
      .first();

    if (!state) throw new Error(`No mission state for ${missionId}`);

    const now = new Date().toISOString();
    const bestScore = Math.max(score, state.bestScore ?? 0);

    await ctx.db.patch(state._id, {
      knowledgeCheckPassed: passed || state.knowledgeCheckPassed,
      knowledgeCheckScore: score,
      bestScore,
      ...(passed
        ? {
            status: "accomplished",
            accomplishedAt: now,
            lastReviewedAt: now,
            xpEarned: state.xpEarned + xpEarned,
          }
        : {}),
    });

    return { passed, score, bestScore, xpEarned };
  },
});
