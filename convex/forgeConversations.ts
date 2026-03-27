import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──

export const getByThreadId = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forgeConversations")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("forgeConversations")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(limit);
  },
});

// ── Mutations ──

export const create = mutation({
  args: {
    threadId: v.string(),
    mode: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("forgeConversations", {
      threadId: args.threadId,
      mode: args.mode,
      messages: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const appendMessage = mutation({
  args: {
    threadId: v.string(),
    role: v.string(),
    content: v.string(),
    cardId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("forgeConversations")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();
    if (!thread) return null;

    const message = {
      role: args.role,
      content: args.content,
      timestamp: new Date().toISOString(),
      cardId: args.cardId,
    };

    await ctx.db.patch(thread._id, {
      messages: [...thread.messages, message],
      updatedAt: new Date().toISOString(),
    });
    return thread._id;
  },
});

export const updateMode = mutation({
  args: {
    threadId: v.string(),
    mode: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("forgeConversations")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();
    if (!thread) return null;
    await ctx.db.patch(thread._id, { mode: args.mode });
    return thread._id;
  },
});

export const clearThread = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("forgeConversations")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();
    if (!thread) return null;
    await ctx.db.patch(thread._id, {
      messages: [],
      updatedAt: new Date().toISOString(),
    });
    return thread._id;
  },
});
