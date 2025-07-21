import { v } from "convex/values";
import { mutation, query, internalQuery, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const add = mutation({
  args: {
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("notes", {
      content: args.content,
      updatedTime: Date.now(),
      ...(args.imageId ? { imageId: args.imageId } : {}),
    });

    // Check if content contains a URL and schedule metadata fetching
    const urlMatch = args.content.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const url = urlMatch[0];
      await ctx.scheduler.runAfter(0, api.notes.fetchLinkMetadata, { url, noteId });
    }

    return noteId;
  },
});

export const update = mutation({
  args: {
    noteId: v.id("notes"),
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.noteId, {
      content: args.content,
      updatedTime: Date.now(),
      ...(args.imageId ? { imageId: args.imageId } : {}),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").order("desc").collect();
    return Promise.all(
      notes.map(async (note) => ({
        ...note,
        imageUrl: note.imageId ? await ctx.storage.getUrl(note.imageId) : null,
      }))
    );
  },
});

export const getNote = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note) return null;
    return {
      ...note,
      imageUrl: note.imageId ? await ctx.storage.getUrl(note.imageId) : null,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getOrCreateThread = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const existingThread = await ctx.db
      .query("threads")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .unique();
    
    if (existingThread) {
      return existingThread._id;
    }

    return await ctx.db.insert("threads", {
      noteId: args.noteId,
    });
  },
});

export const fetchLinkMetadata = action({
  args: { 
    url: v.string(),
    noteId: v.id("notes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const response = await fetch(args.url);
      const html = await response.text();
      
      // Check if it's a YouTube URL
      const isYouTube = args.url.includes('youtube.com') || args.url.includes('youtu.be');
      
      let title = null;
      let description = null;
      let icon = null;
      let image = null;
      
      if (isYouTube) {
        // Extract YouTube video title from og:title or twitter:title
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        const twitterTitleMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
        title = ogTitleMatch ? ogTitleMatch[1].trim() : twitterTitleMatch ? twitterTitleMatch[1].trim() : null;
        
        // Extract YouTube video description from og:description or twitter:description
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        const twitterDescMatch = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);
        description = ogDescMatch ? ogDescMatch[1].trim() : twitterDescMatch ? twitterDescMatch[1].trim() : undefined;
        
        // Extract YouTube thumbnail from og:image
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        image = ogImageMatch ? ogImageMatch[1] : undefined;
        
        // Use YouTube favicon
        icon = "https://www.youtube.com/favicon.ico";
      } else {
        // For non-YouTube sites, use the original extraction logic
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = titleMatch ? titleMatch[1].trim() : null;
        
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        description = descMatch ? descMatch[1].trim() : undefined;
        
        const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
        icon = iconMatch ? iconMatch[1] : undefined;
        
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        image = ogImageMatch ? ogImageMatch[1] : undefined;
        
        // Handle relative URLs for icon
        if (icon && !icon.startsWith('http')) {
          const urlObj = new URL(args.url);
          icon = new URL(icon, urlObj.origin).href;
        }
      }
      
      if (title) {
        await ctx.runMutation(api.notes.updateLinkMetadata, {
          noteId: args.noteId,
          linkMetadata: {
            url: args.url,
            title,
            description: description || undefined,
            icon: icon || undefined,
            image: image || undefined,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching link metadata:", error);
    }
    return null;
  },
});

export const updateLinkMetadata = mutation({
  args: {
    noteId: v.id("notes"),
    linkMetadata: v.object({
      url: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      image: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.noteId, {
      linkMetadata: args.linkMetadata,
    });
    return null;
  },
});

export const createNote = mutation({
  args: {
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("notes", {
      content: args.content,
      imageId: args.imageId,
      updatedTime: Date.now(),
    });

    // Check if content contains a URL and schedule metadata fetching
    const urlMatch = args.content.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const url = urlMatch[0];
      await ctx.scheduler.runAfter(0, api.notes.fetchLinkMetadata, { url, noteId });
    }

    return noteId;
  },
});

export const deleteNote = mutation({
  args: {
    noteId: v.id("notes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Delete the associated thread first
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .unique();
    
    if (thread) {
      // Delete all messages in the thread
      const messages = await ctx.db
        .query("messages")
        .filter((q) => q.eq(q.field("threadId"), thread._id))
        .collect();
      
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      
      // Delete the thread
      await ctx.db.delete(thread._id);
    }
    
    // Delete the note
    await ctx.db.delete(args.noteId);
    return null;
  },
});
