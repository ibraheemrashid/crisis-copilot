import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    crisisType: v.string(),
    description: v.string(),
    answers: v.array(v.string()),
    urgency: v.string(),
    actions: v.array(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", args);
  },
});

export const updateCondition = mutation({
  args: {
    id: v.id("sessions"),
    condition: v.string(),
    updatedAt: v.number(),
  },
  handler: async (ctx, { id, condition, updatedAt }) => {
    await ctx.db.patch(id, { condition, updatedAt });
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("sessions").order("desc").take(10);
  },
});
