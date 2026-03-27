import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("forgeCards").collect();
  },
});

export const getByTopic = query({
  args: { topicId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forgeCards")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();
  },
});

export const getByCardId = query({
  args: { cardId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forgeCards")
      .withIndex("by_cardId", (q) => q.eq("cardId", args.cardId))
      .first();
  },
});

export const getDue = query({
  args: { topicId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    let cards;
    if (args.topicId) {
      cards = await ctx.db
        .query("forgeCards")
        .withIndex("by_topic", (q) => q.eq("topicId", args.topicId!))
        .collect();
    } else {
      cards = await ctx.db.query("forgeCards").collect();
    }
    return cards.filter((c) => c.dueDate <= today);
  },
});

export const getNew = query({
  args: { topicId: v.optional(v.string()), maxTier: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let cards;
    if (args.topicId) {
      cards = await ctx.db
        .query("forgeCards")
        .withIndex("by_topic", (q) => q.eq("topicId", args.topicId!))
        .collect();
    } else {
      cards = await ctx.db.query("forgeCards").collect();
    }
    return cards.filter((c) => {
      if (c.repetitions !== 0) return false;
      if (args.maxTier && c.tier > args.maxTier) return false;
      return true;
    });
  },
});

export const isSeeded = query({
  args: {},
  handler: async (ctx) => {
    const first = await ctx.db.query("forgeCards").first();
    return first !== null;
  },
});

// ── Mutations ──

export const updateCard = mutation({
  args: {
    cardId: v.string(),
    easeFactor: v.number(),
    interval: v.number(),
    repetitions: v.number(),
    dueDate: v.string(),
    lastReview: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("forgeCards")
      .withIndex("by_cardId", (q) => q.eq("cardId", args.cardId))
      .first();
    if (!card) return null;
    await ctx.db.patch(card._id, {
      easeFactor: args.easeFactor,
      interval: args.interval,
      repetitions: args.repetitions,
      dueDate: args.dueDate,
      lastReview: args.lastReview,
    });
    return card._id;
  },
});

export const deleteByTopic = mutation({
  args: { topicId: v.string() },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("forgeCards")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();
    for (const card of cards) {
      await ctx.db.delete(card._id);
    }
    return cards.length;
  },
});

export const seedCards = mutation({
  args: {
    cards: v.array(v.object({
      cardId: v.string(),
      topicId: v.string(),
      type: v.string(),
      front: v.string(),
      back: v.string(),
      difficulty: v.number(),
      tier: v.number(),
      steps: v.optional(v.array(v.string())),
      easeFactor: v.number(),
      interval: v.number(),
      repetitions: v.number(),
      dueDate: v.string(),
      lastReview: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    for (const card of args.cards) {
      await ctx.db.insert("forgeCards", card);
    }
    return args.cards.length;
  },
});
