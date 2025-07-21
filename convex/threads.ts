import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const askAI = action({
  args: {
    threadId: v.id("threads"),
    noteId: v.id("notes"),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    // Note: Actions don't have access to ctx.db, so we can't check authentication here
    // The authentication check should be done in the calling function
    
    // First add the user's question as a message
    await ctx.runMutation(internal.messages.sendInternalMessage, {
      threadId: args.threadId,
      content: args.question,
      type: "user",
    });

    // Get the note content
    const note = await ctx.runQuery(api.notes.getNote, { noteId: args.noteId });
    if (!note) {
      throw new Error("Note not found");
    }

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant. The user is asking about this note: "${note.content}"`,
        },
        { role: "user", content: args.question },
      ],
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Save the AI response as a message
    await ctx.runMutation(internal.messages.sendInternalMessage, {
      threadId: args.threadId,
      content: aiResponse,
      type: "ai",
    });

    return null;
  },
});
