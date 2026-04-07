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
    sortOrder: v.optional(v.number()),     // Curriculum order within topic+tier
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
    .index("by_topic_tier", ["topicId", "tier"])
    .index("by_topic_due", ["topicId", "dueDate"]),

  forgeReviews: defineTable({
    cardId: v.string(),            // References forgeCards.cardId
    timestamp: v.string(),
    quality: v.number(),           // 0-5
    responseTime: v.number(),      // Milliseconds
  })
    .index("by_card", ["cardId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_card_timestamp", ["cardId", "timestamp"]),

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
    chunks: v.optional(v.array(v.object({
      label: v.string(),
      summary: v.string(),
      content: v.string(),
    }))),
  })
    .index("by_storyId", ["storyId"]),

  forgeSpeedRuns: defineTable({
    timestamp: v.string(),
    topicId: v.string(),               // topic id or "mixed"
    cardTypeFilter: v.array(v.string()), // ["easy"] | ["intermediate"] | etc.
    startingTime: v.number(),           // 45 | 60 | 90
    totalCards: v.number(),
    correctCards: v.number(),
    partialCards: v.number(),
    wrongCards: v.number(),
    totalPoints: v.number(),
    bestStreak: v.number(),
    avgResponseMs: v.number(),
    cardResults: v.array(v.object({
      cardId: v.string(),
      result: v.string(),              // "correct" | "partial" | "wrong"
      userInput: v.string(),
      responseMs: v.number(),
      feedback: v.string(),
    })),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_topic", ["topicId"])
    .index("by_points", ["totalPoints"]),

  forgeDrills: defineTable({
    scenarioId: v.string(),          // e.g. "gpu-node-unresponsive"
    timestamp: v.string(),
    totalSteps: v.number(),
    completedSteps: v.number(),
    steps: v.array(v.object({
      stepIndex: v.number(),
      userResponse: v.string(),
      matchedTerms: v.array(v.string()),
      totalTerms: v.number(),
      usedHints: v.boolean(),
    })),
    overallTermHitRate: v.number(),   // 0-100
  })
    .index("by_scenario", ["scenarioId"])
    .index("by_timestamp", ["timestamp"]),

  // ── Phase 2: Campaign / Mission / Bounty ──

  forgeCampaignProgress: defineTable({
    campaignId: v.string(),
    enrolled: v.boolean(),
    enrolledAt: v.string(),
    currentMissionIndex: v.number(),
    completedMissions: v.array(v.string()),
    lastActivityAt: v.string(),
  })
    .index("by_campaignId", ["campaignId"]),

  forgeMissionProgress: defineTable({
    missionId: v.string(),
    status: v.string(),          // "locked" | "available" | "in-progress" | "accomplished" | "decaying"
    customLoadout: v.optional(v.array(v.object({
      id: v.string(),
      type: v.string(),
      label: v.string(),
      description: v.string(),
      estimatedMinutes: v.number(),
      required: v.boolean(),
      contentRef: v.object({
        kind: v.string(),
        id: v.string(),
        params: v.optional(v.any()),
      }),
    }))),
    stepsCompleted: v.array(v.string()),
    knowledgeCheckPassed: v.boolean(),
    knowledgeCheckScore: v.optional(v.number()),
    bestScore: v.optional(v.number()),
    accomplishedAt: v.optional(v.string()),
    lastReviewedAt: v.optional(v.string()),
    xpEarned: v.number(),
  })
    .index("by_missionId", ["missionId"])
    .index("by_status", ["status"]),

  forgeBountyHistory: defineTable({
    bountyId: v.string(),
    completedAt: v.string(),
    score: v.number(),
    xpEarned: v.number(),
  })
    .index("by_bountyId", ["bountyId"])
    .index("by_completedAt", ["completedAt"]),

  forgeDiagnosisHistory: defineTable({
    scenarioId: v.string(),
    completedAt: v.string(),
    difficulty: v.string(),       // "learning" | "guided" | "independent" | "full"
    score: v.number(),            // 0-100
    stepsCompleted: v.number(),
    totalSteps: v.number(),
    xpEarned: v.number(),
  })
    .index("by_scenarioId", ["scenarioId"])
    .index("by_completedAt", ["completedAt"]),

  forgeQuickDrawHistory: defineTable({
    moduleId: v.string(),
    completedAt: v.string(),
    score: v.number(),
    totalItems: v.number(),
    correctItems: v.number(),
    timeMs: v.number(),
    xpEarned: v.number(),
  })
    .index("by_moduleId", ["moduleId"])
    .index("by_completedAt", ["completedAt"]),

  forgeConversations: defineTable({
    threadId: v.string(),          // UUID — client-generated
    title: v.optional(v.string()), // Auto-generated from first user message, editable
    mode: v.string(),              // legacy — kept for compat, always "agent"
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
