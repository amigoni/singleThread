import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const sendMessage = mutation({
  args: {
    content: v.string(),
    threadId: v.id("threads"),
    type: v.union(v.literal("user"), v.literal("ai")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify the thread belongs to a note owned by the current user
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    const note = await ctx.db.get(thread.noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Not authorized to send messages in this thread");
    }

    await ctx.db.insert("messages", {
      content: args.content,
      threadId: args.threadId,
      type: args.type,
      createdTime: Date.now(),
    });
  },
});

export const sendInternalMessage = internalMutation({
  args: {
    content: v.string(),
    threadId: v.id("threads"),
    type: v.union(v.literal("user"), v.literal("ai")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      content: args.content,
      threadId: args.threadId,
      type: args.type,
      createdTime: Date.now(),
    });
  },
});

export const listMessages = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify the thread belongs to a note owned by the current user
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      return [];
    }

    const note = await ctx.db.get(thread.noteId);
    if (!note || note.userId !== userId) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .order("asc")
      .collect();
    return messages;
  },
});
