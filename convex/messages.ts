import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const sendMessage = mutation({
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
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .order("asc")
      .collect();
    return messages;
  },
});
