import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByTicket = query({
  args: { ticketId: v.string() },
  handler: async (ctx, { ticketId }) => {
    return ctx.db
      .query("forgeTicketHistory")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", ticketId))
      .collect();
  },
});

export const getBestByTicket = query({
  args: { ticketId: v.string() },
  handler: async (ctx, { ticketId }) => {
    const records = await ctx.db
      .query("forgeTicketHistory")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", ticketId))
      .collect();
    if (records.length === 0) return null;
    return records.reduce((best, r) => (r.score > best.score ? r : best));
  },
});

export const getByDifficulty = query({
  args: { difficulty: v.string() },
  handler: async (ctx, { difficulty }) => {
    return ctx.db
      .query("forgeTicketHistory")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", difficulty))
      .collect();
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const results = await ctx.db
      .query("forgeTicketHistory")
      .withIndex("by_completedAt")
      .order("desc")
      .collect();
    return results.slice(0, limit ?? 20);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("forgeTicketHistory").collect();
  },
});

export const add = mutation({
  args: {
    ticketId: v.string(),
    difficulty: v.string(),
    score: v.number(),
    commandsUsed: v.array(v.string()),
    answer: v.string(),
    usedHint: v.boolean(),
    xpEarned: v.number(),
    timeMs: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("forgeTicketHistory", {
      ...args,
      completedAt: new Date().toISOString(),
    });
  },
});
