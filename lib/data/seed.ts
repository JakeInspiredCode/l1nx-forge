"use client";

import { getAllSeedCards } from "@/lib/seeds";
import { ALL_MISSIONS } from "@/lib/seeds/campaigns";
import type { ForgeCard } from "@/lib/types";
import { getState, replaceState, uid } from "./store";
import type { Doc, State } from "./schema";

const DEFAULT_CAMPAIGN_IDS = [
  "linux-core",
  "linux-advanced",
  "hardware-core",
  "networking-core",
  "fiber-core",
  "power-core",
  "ops-core",
  "scale-core",
];

function now(): number {
  return Date.now();
}

function toCardDoc(c: ForgeCard): Doc<{
  cardId: string; topicId: string; type: string; front: string; back: string;
  difficulty: number; tier: number; steps?: string[]; sortOrder?: number;
  easeFactor: number; interval: number; repetitions: number; dueDate: string;
  lastReview?: string;
}> {
  return {
    _id: uid(),
    _creationTime: now(),
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
    lastReview: c.lastReview ?? undefined,
  };
}

// Seed a fresh store if the user has no data. Idempotent — skips any table that
// already has rows.
export function seedIfEmpty(): void {
  const state = getState();
  const patch: Partial<State> = {};

  if (state.forgeCards.length === 0) {
    patch.forgeCards = getAllSeedCards().map(toCardDoc);
  }

  if (state.forgeProfile.length === 0) {
    patch.forgeProfile = [{
      _id: uid(),
      _creationTime: now(),
      profileId: "default",
      streak: 0,
      lastSessionDate: "",
      totalPoints: 0,
      badges: [],
      totalSessionMinutes: 0,
    }];
  }

  if (state.forgeCampaignProgress.length === 0) {
    const ts = new Date().toISOString();
    patch.forgeCampaignProgress = DEFAULT_CAMPAIGN_IDS.map((id) => ({
      _id: uid(),
      _creationTime: now(),
      campaignId: id,
      enrolled: true,
      enrolledAt: ts,
      currentMissionIndex: 0,
      completedMissions: [],
      lastActivityAt: ts,
    }));
  }

  if (state.forgeMissionProgress.length === 0) {
    patch.forgeMissionProgress = ALL_MISSIONS.map((m) => ({
      _id: uid(),
      _creationTime: now(),
      missionId: m.id,
      status: "available",
      stepsCompleted: [],
      knowledgeCheckPassed: false,
      xpEarned: 0,
    }));
  }

  if (Object.keys(patch).length > 0) {
    replaceState(patch);
  }
}
