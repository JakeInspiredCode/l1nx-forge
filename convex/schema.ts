// ═══════════════════════════════════════════════════════════════════════════════
// L1NX FORGE SCHEMA
// Deployment: l1nx-forge (separate from life-command-center)
// ═══════════════════════════════════════════════════════════════════════════════

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  forgeCards: defineTable({
    cardId: v.string(),            // "linux-001" — app-level ID
    topicId: v.string(),           // "linux" | "hardware" | "fiber" | etc.
    type: v.string(),              // "easy" | "intermediate" | "scenario"
    front: v.string(),             // Question (markdown)
    back: v.string(),              // Answer (markdown)
    difficulty: v.number(),        // 1 | 2 | 3
    tier: v.number(),              // 1-4
    steps: v.optional(v.array(v.string())), // Tier 4 branching steps
    // SM-2 state
    easeFactor: v.number(),        // Default 2.5, min 1.3
    interval: v.number(),          // Days until next review
    repetitions: v.number(),       // Consecutive correct
    dueDate: v.string(),           // ISO date string
    lastReview: v.optional(v.string()),
  })
    .index("by_topic", ["topicId"])
    .index("by_cardId", ["cardId"])
    .index("by_due", ["dueDate"])
    .index("by_topic_tier", ["topicId", "tier"]),

  forgeReviews: defineTable({
    cardId: v.string(),            // References forgeCards.cardId
    timestamp: v.string(),
    quality: v.number(),           // 0-5
    responseTime: v.number(),      // Milliseconds
  })
    .index("by_card", ["cardId"])
    .index("by_timestamp", ["timestamp"]),

  forgeSessions: defineTable({
    type: v.string(),              // "mock-interview" | "daily-training" | "topic-drill"
    startTime: v.string(),
    endTime: v.optional(v.string()),
    cardIds: v.array(v.string()),
    answers: v.array(v.object({
      cardId: v.string(),
      transcript: v.string(),
      rubricScores: v.object({
        technical: v.number(),
        structure: v.number(),
        ownership: v.number(),
      }),
      missedTerms: v.array(v.string()),
    })),
    overallScore: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_startTime", ["startTime"]),

  forgeProgress: defineTable({
    topicId: v.string(),
    masteryPercent: v.number(),
    currentTier: v.number(),       // 1-4
    tierProgress: v.object({
      tier1: v.object({ total: v.number(), qualified: v.number() }),
      tier2: v.object({ total: v.number(), qualified: v.number() }),
      tier3: v.object({ total: v.number(), qualified: v.number() }),
      tier4: v.object({ total: v.number(), qualified: v.number() }),
    }),
    totalCards: v.number(),
    masteredCards: v.number(),
    learningCards: v.number(),
    newCards: v.number(),
    weakFlag: v.boolean(),
    lastUpdated: v.string(),
  })
    .index("by_topic", ["topicId"]),

  forgeProfile: defineTable({
    profileId: v.string(),         // "default" — singleton
    streak: v.number(),
    lastSessionDate: v.string(),
    totalPoints: v.number(),
    badges: v.array(v.string()),
    totalSessionMinutes: v.number(),
  })
    .index("by_profileId", ["profileId"]),

  forgeStories: defineTable({
    storyId: v.string(),
    question: v.string(),
    framework: v.string(),
    answer: v.string(),
  })
    .index("by_storyId", ["storyId"]),

  forgeConversations: defineTable({
    threadId: v.string(),          // UUID — client-generated
    mode: v.string(),              // "coach" | "quiz" | "mock-interview"
    messages: v.array(v.object({
      role: v.string(),            // "user" | "assistant"
      content: v.string(),
      timestamp: v.string(),
      cardId: v.optional(v.string()), // card being discussed, if any
    })),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_threadId", ["threadId"])
    .index("by_updatedAt", ["updatedAt"]),
});
