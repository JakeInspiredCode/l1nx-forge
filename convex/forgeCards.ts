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

export const getByTopicTier = query({
  args: { topicId: v.string(), tier: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forgeCards")
      .withIndex("by_topic_tier", (q) =>
        q.eq("topicId", args.topicId).eq("tier", args.tier)
      )
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
    if (args.topicId) {
      // Use composite index: filter by topic, then scan for due dates
      const cards = await ctx.db
        .query("forgeCards")
        .withIndex("by_topic_due", (q) =>
          q.eq("topicId", args.topicId!).lte("dueDate", today)
        )
        .collect();
      return cards;
    }
    // No topic filter: use dueDate index directly
    return await ctx.db
      .query("forgeCards")
      .withIndex("by_due", (q) => q.lte("dueDate", today))
      .collect();
  },
});

export const getNew = query({
  args: { topicId: v.optional(v.string()), maxTier: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Fetch by topic (indexed) then filter for new cards (repetitions === 0)
    // The repetitions filter operates on a much smaller set when scoped to a topic
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
      if (args.maxTier != null && c.tier > args.maxTier) return false;
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

export const addCard = mutation({
  args: {
    cardId: v.string(),
    topicId: v.string(),
    type: v.string(),
    front: v.string(),
    back: v.string(),
    difficulty: v.number(),
    tier: v.number(),
    steps: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check for duplicate cardId
    const existing = await ctx.db
      .query("forgeCards")
      .withIndex("by_cardId", (q) => q.eq("cardId", args.cardId))
      .first();
    if (existing) return { error: "Card with this ID already exists", id: null };

    const id = await ctx.db.insert("forgeCards", {
      ...args,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      dueDate: new Date().toISOString().split("T")[0],
    });
    return { error: null, id };
  },
});

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
      sortOrder: v.optional(v.number()),
      easeFactor: v.number(),
      interval: v.number(),
      repetitions: v.number(),
      dueDate: v.string(),
      lastReview: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    for (const card of args.cards) {
      // Skip if this cardId already exists (prevent duplicate seeding)
      const existing = await ctx.db
        .query("forgeCards")
        .withIndex("by_cardId", (q) => q.eq("cardId", card.cardId))
        .first();
      if (!existing) {
        await ctx.db.insert("forgeCards", card);
        inserted++;
      }
    }
    return inserted;
  },
});

// Upsert cards: update existing card text, insert new cards, preserve review progress
export const reseedCards = mutation({
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
      sortOrder: v.optional(v.number()),
      easeFactor: v.number(),
      interval: v.number(),
      repetitions: v.number(),
      dueDate: v.string(),
      lastReview: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;
    for (const card of args.cards) {
      const existing = await ctx.db
        .query("forgeCards")
        .withIndex("by_cardId", (q) => q.eq("cardId", card.cardId))
        .first();
      if (existing) {
        // Update text but preserve review progress
        await ctx.db.patch(existing._id, {
          front: card.front,
          back: card.back,
          topicId: card.topicId,
          type: card.type,
          difficulty: card.difficulty,
          tier: card.tier,
          steps: card.steps,
          sortOrder: card.sortOrder,
        });
        updated++;
      } else {
        await ctx.db.insert("forgeCards", card);
        inserted++;
      }
    }
    return { inserted, updated };
  },
});

// Remove duplicate cards, keeping only the one with the most review progress
export const dedup = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("forgeCards").collect();
    const groups = new Map<string, typeof all>();
    for (const card of all) {
      const existing = groups.get(card.cardId) ?? [];
      existing.push(card);
      groups.set(card.cardId, existing);
    }
    let deleted = 0;
    for (const [, dupes] of groups) {
      if (dupes.length <= 1) continue;
      // Keep the card with the most repetitions (most reviewed)
      dupes.sort((a, b) => (b.repetitions ?? 0) - (a.repetitions ?? 0));
      for (let i = 1; i < dupes.length; i++) {
        await ctx.db.delete(dupes[i]._id);
        deleted++;
      }
    }
    return deleted;
  },
});
