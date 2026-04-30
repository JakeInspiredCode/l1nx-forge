"use client";

// Seeds a "lived-in" demo user so the static demo build doesn't land on an
// empty dashboard. Idempotent — only fills tables that are empty after the
// normal seed runs.

import { TOPICS, type TopicId } from "@/lib/types";
import { ALL_MISSIONS } from "@/lib/seeds/campaigns";
import { getAllSeedCards } from "@/lib/seeds";
import { getState, mutateMany, uid } from "./store";
import type { Doc, State } from "./schema";

const DEMO_PROFILE_ID = "default";

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number, hour = 19, minute = 0): string {
  const d = new Date(Date.now() - days * DAY_MS);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateDaysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString().split("T")[0];
}

// Mastery targets per topic — intentionally uneven to make the radar chart
// look real and expose weak areas the demo user is "working on".
const MASTERY_BY_TOPIC: Record<TopicId, { pct: number; tier: 1 | 2 | 3 | 4; weak: boolean }> = {
  linux: { pct: 72, tier: 3, weak: false },
  hardware: { pct: 58, tier: 2, weak: false },
  networking: { pct: 51, tier: 2, weak: false },
  "power-cooling": { pct: 44, tier: 2, weak: false },
  "ops-processes": { pct: 39, tier: 1, weak: false },
  behavioral: { pct: 61, tier: 2, weak: false },
  fiber: { pct: 28, tier: 1, weak: true },
  scale: { pct: 19, tier: 1, weak: true },
};

function buildProfile(): Doc<State["forgeProfile"][number]> {
  return {
    _id: uid(),
    _creationTime: Date.now() - 21 * DAY_MS,
    profileId: DEMO_PROFILE_ID,
    streak: 12,
    lastSessionDate: dateDaysAgo(0),
    totalPoints: 3425,
    badges: [
      "first-forge",
      "first-flip",
      "first-speed",
      "first-correct",
      "first-topic",
      "cards-10",
      "cards-25",
      "cards-50",
      "cards-100",
      "cards-250",
      "points-100",
      "points-500",
      "points-1000",
      "streak-2",
      "streak-3",
      "streak-5",
      "streak-7",
      "sessions-3",
      "sessions-10",
      "linux-beginner",
      "network-beginner",
      "hardware-beginner",
      "any-topic-50",
      "tier-2-any",
      "tier-3-any",
      "first-drill",
      "drill-3",
      "drill-80",
      "perfect-session",
    ],
    totalSessionMinutes: 287,
  };
}

function buildProgress(): Doc<State["forgeProgress"][number]>[] {
  const cards = getAllSeedCards();
  return TOPICS.map((topic) => {
    const target = MASTERY_BY_TOPIC[topic.id];
    const topicCards = cards.filter((c) => c.topicId === topic.id);
    const totalCards = topicCards.length;
    const masteredCards = Math.round(totalCards * (target.pct / 100));
    const learningCards = Math.min(
      Math.round(totalCards * 0.25),
      totalCards - masteredCards,
    );
    const newCards = Math.max(0, totalCards - masteredCards - learningCards);

    const tierCounts = [1, 2, 3, 4].reduce<
      Record<string, { total: number; qualified: number }>
    >((acc, tierIdx) => {
      const inTier = topicCards.filter((c) => c.tier === tierIdx).length;
      const qualified =
        tierIdx < target.tier
          ? Math.round(inTier * 0.9)
          : tierIdx === target.tier
            ? Math.round(inTier * 0.45)
            : 0;
      acc[`tier${tierIdx}`] = { total: inTier, qualified };
      return acc;
    }, {});

    return {
      _id: uid(),
      _creationTime: Date.now() - 21 * DAY_MS,
      topicId: topic.id,
      masteryPercent: target.pct,
      currentTier: target.tier,
      tierProgress: {
        tier1: tierCounts.tier1 ?? { total: 0, qualified: 0 },
        tier2: tierCounts.tier2 ?? { total: 0, qualified: 0 },
        tier3: tierCounts.tier3 ?? { total: 0, qualified: 0 },
        tier4: tierCounts.tier4 ?? { total: 0, qualified: 0 },
      },
      totalCards,
      masteredCards,
      learningCards,
      newCards,
      weakFlag: target.weak,
      lastUpdated: isoDaysAgo(target.weak ? 3 : 0),
    };
  });
}

// Build a plausible review history: ~14-25 reviews/day for the last 12 days,
// weighted toward quality 3-5 with occasional 2s. Deterministic — no RNG.
function buildReviews(cardsByTopic: Record<string, string[]>): Doc<State["forgeReviews"][number]>[] {
  const reviews: Doc<State["forgeReviews"][number]>[] = [];
  const reviewsPerDay = [22, 18, 16, 24, 20, 14, 19, 17, 21, 15, 23, 18];
  const qualityRotation = [5, 4, 5, 3, 4, 5, 4, 2, 5, 4, 3, 4, 5, 5, 4];
  const responseRotation = [2400, 3800, 4100, 2900, 5200, 3300, 2700, 6100];
  let qIdx = 0;
  let rIdx = 0;

  const topicKeys = Object.keys(cardsByTopic);

  reviewsPerDay.forEach((count, dayOffset) => {
    for (let i = 0; i < count; i++) {
      const topic = topicKeys[(i + dayOffset) % topicKeys.length];
      const cardIds = cardsByTopic[topic];
      if (!cardIds.length) continue;
      const cardId = cardIds[(i * 3 + dayOffset) % cardIds.length];
      const timestamp = new Date(
        Date.now() - dayOffset * DAY_MS + (i * 7 * 60 * 1000),
      );
      timestamp.setHours(19, 0, 0, 0);
      reviews.push({
        _id: uid(),
        _creationTime: timestamp.getTime(),
        cardId,
        timestamp: timestamp.toISOString(),
        quality: qualityRotation[qIdx++ % qualityRotation.length],
        responseTime: responseRotation[rIdx++ % responseRotation.length],
      });
    }
  });
  return reviews;
}

function buildSessions(cardsByTopic: Record<string, string[]>): Doc<State["forgeSessions"][number]>[] {
  const sessions: Doc<State["forgeSessions"][number]>[] = [];
  // Two mock interviews + one topic drill, over the past 10 days.
  const interviewTemplates = [
    {
      dayOffset: 2,
      topic: "behavioral",
      overall: 84,
      answers: [
        {
          quality: [5, 4, 5] as [number, number, number],
          missed: ["MTTR definition"],
          transcript:
            "Walked through the STAR framework for a time I led a datacenter migration. Quantified impact as 32% faster cutover.",
        },
        {
          quality: [4, 4, 5] as [number, number, number],
          missed: [],
          transcript:
            "Described the incident where I caught a fiber polarity mismatch before a production cutover.",
        },
      ],
    },
    {
      dayOffset: 5,
      topic: "linux",
      overall: 78,
      answers: [
        {
          quality: [5, 4, 4] as [number, number, number],
          missed: ["SELinux enforcing vs permissive"],
          transcript:
            "Explained systemd unit ordering with After= and Wants=. Noted difference between .service and .target units.",
        },
        {
          quality: [3, 4, 4] as [number, number, number],
          missed: ["journalctl vacuum"],
          transcript:
            "Walked through diagnosing a full disk — inode vs block exhaustion, followed by df -i and lsof +L1.",
        },
      ],
    },
    {
      dayOffset: 9,
      topic: "hardware",
      overall: 71,
      answers: [
        {
          quality: [4, 4, 3] as [number, number, number],
          missed: ["PCIe bus reset syntax", "NVSwitch count"],
          transcript:
            "Walked the GPU-off-bus triage: lspci → nvidia-smi → BMC SEL → PCIe reset → reseat → RMA.",
        },
      ],
    },
  ];

  interviewTemplates.forEach((t) => {
    const pool = cardsByTopic[t.topic] ?? [];
    const cardIds = pool.slice(0, t.answers.length);
    const start = new Date(Date.now() - t.dayOffset * DAY_MS);
    start.setHours(20, 30, 0, 0);
    const end = new Date(start.getTime() + 22 * 60 * 1000);

    sessions.push({
      _id: uid(),
      _creationTime: start.getTime(),
      type: "mock-interview",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      cardIds,
      answers: t.answers.map((a, i) => ({
        cardId: cardIds[i] ?? `demo-${t.topic}-${i}`,
        transcript: a.transcript,
        rubricScores: {
          technical: a.quality[0],
          structure: a.quality[1],
          ownership: a.quality[2],
        },
        missedTerms: a.missed,
      })),
      overallScore: t.overall,
    });
  });

  return sessions;
}

function buildCampaignProgress(existing: Doc<State["forgeCampaignProgress"][number]>[]): Doc<State["forgeCampaignProgress"][number]>[] {
  // Advance three campaigns; leave others enrolled-but-untouched.
  const advancePlan: Record<string, { index: number; completed: string[] }> = {
    "linux-core": { index: 5, completed: ["lx-m01", "lx-m02", "lx-m03", "lx-m04"] },
    "hardware-core": { index: 3, completed: ["hw-m01", "hw-m02"] },
    "networking-core": { index: 1, completed: [] },
  };
  const ts = new Date().toISOString();

  return existing.map((row) => {
    const plan = advancePlan[row.campaignId];
    if (!plan) return row;
    return {
      ...row,
      currentMissionIndex: plan.index,
      completedMissions: plan.completed,
      lastActivityAt: ts,
    };
  });
}

function buildMissionProgress(existing: Doc<State["forgeMissionProgress"][number]>[]): Doc<State["forgeMissionProgress"][number]>[] {
  const accomplishedIds = new Set([
    "lx-m01",
    "lx-m02",
    "lx-m03",
    "lx-m04",
    "hw-m01",
    "hw-m02",
  ]);
  const inProgressIds = new Set(["lx-m05", "hw-m03", "net-m01"]);

  return existing.map((row) => {
    const matched = ALL_MISSIONS.find((m) => m.id === row.missionId);
    if (!matched) return row;
    if (accomplishedIds.has(row.missionId)) {
      return {
        ...row,
        status: "accomplished",
        stepsCompleted: ["step-1", "step-2", "step-3"],
        knowledgeCheckPassed: true,
        knowledgeCheckScore: 88,
        bestScore: 92,
        accomplishedAt: isoDaysAgo(
          Math.max(1, 10 - Array.from(accomplishedIds).indexOf(row.missionId)),
        ),
        lastReviewedAt: isoDaysAgo(2),
        xpEarned: 450,
      };
    }
    if (inProgressIds.has(row.missionId)) {
      return {
        ...row,
        status: "in-progress",
        stepsCompleted: ["step-1"],
        knowledgeCheckPassed: false,
        xpEarned: 120,
      };
    }
    return row;
  });
}

function buildDiagnosisHistory(): Doc<State["forgeDiagnosisHistory"][number]>[] {
  const entries = [
    { scenarioId: "net-packet-loss", difficulty: "medium", score: 88, steps: 5, total: 5 },
    { scenarioId: "gpu-fell-off-bus", difficulty: "hard", score: 72, steps: 4, total: 5 },
    { scenarioId: "disk-full", difficulty: "easy", score: 100, steps: 3, total: 3 },
  ];
  return entries.map((e, i) => ({
    _id: uid(),
    _creationTime: Date.now() - (i + 1) * DAY_MS,
    scenarioId: e.scenarioId,
    completedAt: isoDaysAgo(i + 1),
    difficulty: e.difficulty,
    score: e.score,
    stepsCompleted: e.steps,
    totalSteps: e.total,
    xpEarned: e.score,
  }));
}

function buildQuickDrawHistory(): Doc<State["forgeQuickDrawHistory"][number]>[] {
  const entries = [
    { moduleId: "linux-basics", score: 94, items: 15, correct: 14, time: 38000 },
    { moduleId: "networking-ports", score: 80, items: 10, correct: 8, time: 29000 },
    { moduleId: "hw-components", score: 73, items: 15, correct: 11, time: 44000 },
    { moduleId: "fiber-basics", score: 67, items: 12, correct: 8, time: 51000 },
  ];
  return entries.map((e, i) => ({
    _id: uid(),
    _creationTime: Date.now() - (i + 1) * DAY_MS,
    moduleId: e.moduleId,
    completedAt: isoDaysAgo(i + 1, 18, 30),
    score: e.score,
    totalItems: e.items,
    correctItems: e.correct,
    timeMs: e.time,
    xpEarned: e.score,
  }));
}

function buildStories(): Doc<State["forgeStories"][number]>[] {
  const stories = [
    {
      storyId: "story-datacenter-migration",
      question: "Tell me about a time you led a project under pressure.",
      framework: "STAR",
      answer:
        "Situation: We had a 72-hour window to migrate 180 GPU servers to a new row without disrupting active training jobs. Task: Own the cutover sequencing, cable plan, and rollback. Action: Built a per-rack MOP with A/B feed verification, ran a dry-run on a spare row, staged pre-labeled patch cables. Result: Zero unplanned downtime, finished 14h ahead of window, cutover became the reference MOP for subsequent rows.",
    },
    {
      storyId: "story-polarity",
      question: "Describe a time you caught a mistake before it caused an outage.",
      framework: "STAR",
      answer:
        "Situation: A new trunk run was being certified the afternoon before a production cutover. Task: Final light-level check on ~80 fibers. Action: VFL on one run showed no light at the far end — traced it to a B-polarity MPO where the CMDB said A. Swapped the cassette, re-tested full trunk. Result: Cutover went clean; if we'd missed it, the entire row of compute would've been unreachable.",
    },
    {
      storyId: "story-runbook",
      question: "Tell me about a process you improved.",
      framework: "STAR",
      answer:
        "Situation: Our disk-replacement runbook averaged 18 min/swap but had three scattered commands for disk-to-slot mapping. Task: Consolidate into one canonical step. Action: Wrote a small wrapper around lsblk + sg_map + ledctl, tested against 12 known drives, documented failure modes. Result: Swap time dropped to 7 min and the new-hire on-call could execute without pairing.",
    },
    {
      storyId: "story-on-call",
      question: "Walk me through your first 30 days on a new on-call rotation.",
      framework: "First 30 Days",
      answer:
        "Week 1: Got access — dashboards, VPN, SSH, IPMI, switch CLIs. Read the runbook index end-to-end. Shadowed two incidents. Week 2: Took the low-severity pager, paired on an escalation. Week 3: Authored one new runbook for a recurring 'false positive' alert the prior on-call flagged. Week 4: Ran a blameless post-incident review for a minor outage I handled solo.",
    },
  ];
  return stories.map((s) => ({
    _id: uid(),
    _creationTime: Date.now() - 14 * DAY_MS,
    storyId: s.storyId,
    question: s.question,
    framework: s.framework,
    answer: s.answer,
  }));
}

// Main entry point — call after seedIfEmpty has filled base tables.
export function seedDemoIfEmpty(): void {
  const state = getState();

  const hasAnyUserActivity =
    state.forgeReviews.length > 0 ||
    state.forgeSessions.length > 0 ||
    state.forgeProgress.length > 0;

  if (hasAnyUserActivity) return;

  // Build card->topic index for review/session population.
  const cardsByTopic: Record<string, string[]> = {};
  state.forgeCards.forEach((c) => {
    const list = cardsByTopic[c.topicId] ?? [];
    list.push(c.cardId);
    cardsByTopic[c.topicId] = list;
  });

  mutateMany((prev) => {
    const patch: Partial<State> = {};

    patch.forgeProfile = [buildProfile()];
    patch.forgeProgress = buildProgress();
    patch.forgeReviews = buildReviews(cardsByTopic);
    patch.forgeSessions = buildSessions(cardsByTopic);
    patch.forgeCampaignProgress = buildCampaignProgress(prev.forgeCampaignProgress);
    patch.forgeMissionProgress = buildMissionProgress(prev.forgeMissionProgress);
    patch.forgeDiagnosisHistory = buildDiagnosisHistory();
    patch.forgeQuickDrawHistory = buildQuickDrawHistory();
    patch.forgeStories = buildStories();

    return patch;
  });
}
