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
    const limit = args.limit ?? 50;
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
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("forgeConversations", {
      threadId: args.threadId,
      title: args.title,
      mode: "agent",
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

    const patch: Record<string, unknown> = {
      messages: [...thread.messages, message],
      updatedAt: new Date().toISOString(),
    };

    // Auto-title from first user message if no title set
    if (!thread.title && args.role === "user") {
      patch.title = args.content.slice(0, 80).replace(/\n/g, " ");
    }

    await ctx.db.patch(thread._id, patch);
    return thread._id;
  },
});

export const renameThread = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("forgeConversations")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();
    if (!thread) return null;
    await ctx.db.patch(thread._id, { title: args.title });
    return thread._id;
  },
});

export const truncateFromIndex = mutation({
  args: {
    threadId: v.string(),
    fromIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("forgeConversations")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();
    if (!thread) return null;
    await ctx.db.patch(thread._id, {
      messages: thread.messages.slice(0, args.fromIndex),
      updatedAt: new Date().toISOString(),
    });
    return thread._id;
  },
});

export const replaceMessages = mutation({
  args: {
    threadId: v.string(),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.string(),
      cardId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("forgeConversations")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();
    if (!thread) return null;
    await ctx.db.patch(thread._id, {
      messages: args.messages,
      updatedAt: new Date().toISOString(),
    });
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

export const deleteThread = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("forgeConversations")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();
    if (!thread) return null;
    await ctx.db.delete(thread._id);
    return thread._id;
  },
});
