import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  notes: defineTable({
    content: v.string(),
    updatedTime: v.number(),
    imageId: v.optional(v.id("_storage")),
    linkMetadata: v.optional(v.object({
      url: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      image: v.optional(v.string()),
    })),
  }),
  messages: defineTable({
    content: v.string(),
    threadId: v.id("threads"),
    type: v.union(v.literal("user"), v.literal("ai")),
    createdTime: v.number(),
  }),
  threads: defineTable({
    noteId: v.id("notes"),
  }).index("by_note", ["noteId"]),
});
