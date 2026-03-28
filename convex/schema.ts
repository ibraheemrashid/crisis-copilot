import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    crisisType: v.string(),
    description: v.string(),
    answers: v.array(v.string()),
    urgency: v.string(),
    actions: v.array(v.string()),
    createdAt: v.number(),
    condition: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }),
});
