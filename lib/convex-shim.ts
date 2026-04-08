"use client";

/**
 * Demo-aware wrappers for Convex React hooks.
 *
 * In demo mode (no NEXT_PUBLIC_CONVEX_URL), useQuery returns an appropriate
 * empty default instead of hanging forever, and useMutation returns a no-op.
 *
 * Every file that imports { useQuery, useMutation } from "convex/react"
 * should import from "@/lib/convex-shim" instead.
 */

import {
  useQuery as realUseQuery,
  useMutation as realUseMutation,
} from "convex/react";
import { DEMO_MODE } from "@/components/convex-provider";
import { getAllSeedCards } from "@/lib/seeds";
import { ALL_MISSIONS } from "@/lib/seeds/campaigns";
import type { ForgeCard } from "@/lib/types";

const FN_NAME = Symbol.for("functionName");

// ── Demo seed cards (converted to Convex document shape) ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _demoCards: any[] | null = null;
function getDemoCards() {
  if (!_demoCards) {
    _demoCards = getAllSeedCards().map((c: ForgeCard) => ({
      _id: c.id,
      _creationTime: 0,
      cardId: c.id,
      topicId: c.topicId,
      type: c.type,
      front: c.front,
      back: c.back,
      difficulty: c.difficulty,
      tier: c.tier,
      steps: c.steps,
      sortOrder: c.sortOrder,
      easeFactor: c.easeFactor,
      interval: c.interval,
      repetitions: c.repetitions,
      dueDate: c.dueDate,
      lastReview: c.lastReview,
    }));
  }
  return _demoCards;
}

// ── Demo profile ──

const DEMO_PROFILE = {
  _id: "demo" as const,
  _creationTime: 0,
  profileId: "default",
  streak: 7,
  lastSessionDate: new Date().toISOString().split("T")[0],
  totalPoints: 1250,
  badges: ["first-review", "streak-3"],
  totalSessionMinutes: 180,
};

// ── Demo campaign states — all enrolled ──

const DEMO_CAMPAIGN_IDS = [
  "linux-core", "hardware-core", "networking-core",
  "fiber-core", "power-core", "ops-core", "scale-core",
];
const DEMO_CAMPAIGN_STATES = DEMO_CAMPAIGN_IDS.map((id) => ({
  _id: `demo-${id}`,
  _creationTime: 0,
  campaignId: id,
  enrolled: true,
  currentMissionIndex: 0,
  completedMissions: [],
}));

// ── Demo mission states — all unlocked ("available") ──

let _demoMissionStates: unknown[] | null = null;
function getDemoMissionStates() {
  if (!_demoMissionStates) {
    _demoMissionStates = ALL_MISSIONS.map((m) => ({
      _id: `demo-${m.id}`,
      _creationTime: 0,
      missionId: m.id,
      status: "available",
      stepsCompleted: [],
      knowledgeCheckPassed: false,
      xpEarned: 0,
    }));
  }
  return _demoMissionStates;
}

// ── Demo defaults ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDemoDefault(fnRef: unknown, args: any): unknown {
  const name = (fnRef as Record<symbol, string>)?.[FN_NAME];

  // Card queries — return seed cards, filtered by args
  switch (name) {
    case "forgeCards:getAll":
      return getDemoCards();
    case "forgeCards:getByTopic":
      return getDemoCards().filter((c) => c.topicId === args?.topicId);
    case "forgeCards:getByTopicTier":
      return getDemoCards().filter(
        (c) => c.topicId === args?.topicId && c.tier === args?.tier
      );
    case "forgeCards:getDue":
      return args?.topicId
        ? getDemoCards().filter((c) => c.topicId === args.topicId).slice(0, 10)
        : getDemoCards().slice(0, 10);
    case "forgeCards:getNew":
      return getDemoCards()
        .filter((c) => c.repetitions === 0 && (!args?.topicId || c.topicId === args.topicId))
        .slice(0, 20);
    case "forgeCards:getByCardId": {
      const card = getDemoCards().find((c) => c.cardId === args?.cardId);
      return card ?? null;
    }
    case "forgeCards:isSeeded":
      return true;
  }

  // Mission state queries
  switch (name) {
    case "forgeMissions:getAllMissionStates":
      return getDemoMissionStates();
    case "forgeMissions:getMissionsByStatus":
      return getDemoMissionStates().filter(
        (m: any) => m.status === args?.status
      );
    case "forgeMissions:getMissionState": {
      const ms = getDemoMissionStates().find(
        (m: any) => m.missionId === args?.missionId
      );
      return ms ?? null;
    }
  }

  // Non-card, non-mission single-value defaults
  const singles: Record<string, unknown> = {
    "forgeProfile:get": DEMO_PROFILE,
    "forgeAgentContext:get": {
      progress: [], dueCards: [], strugglingCards: [],
      recentReviews: [], recentSessions: [],
      profile: DEMO_PROFILE,
      stats: { totalCards: 0, totalReviews: 0, avgQuality: 0 },
    },
    "forgeConversations:getByThreadId": null,
    "forgeDrills:getBestByScenario": null,
    "forgeSpeedRuns:getBestScore": null,
    "forgeProgress:getByTopic": null,
    "forgeDiagnosisHistory:getBestByScenario": null,
    "forgeQuickDrawHistory:getBestByModule": null,
    "forgeBounties:getBestBountyScore": null,
    "forgeCampaigns:getCampaignState": null,
    "forgeCampaigns:getAllCampaignStates": DEMO_CAMPAIGN_STATES,
    "forgeCampaigns:getEnrolledCampaigns": DEMO_CAMPAIGN_STATES,
  };

  if (name && name in singles) return singles[name];
  return [];
}

// ── Exports ──

/* eslint-disable @typescript-eslint/no-explicit-any */
export const useQuery: typeof realUseQuery = ((...args: any[]) => {
  const real = (realUseQuery as any)(...args);
  if (DEMO_MODE) return getDemoDefault(args[0], args[1]);
  return real;
}) as any;

export const useMutation: typeof realUseMutation = ((...args: any[]) => {
  const real = (realUseMutation as any)(...args);
  if (DEMO_MODE) return (async () => {}) as any;
  return real;
}) as any;
/* eslint-enable @typescript-eslint/no-explicit-any */
