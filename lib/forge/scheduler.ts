// ═══════════════════════════════════════
// Daily Scheduler — F3 from build plan
// Generates a 60-minute block-based training plan
// ═══════════════════════════════════════

import { TOPICS } from "../types";

// Card shape from Convex (loose typing to avoid import coupling)
interface SchedulerCard {
  cardId: string;
  topicId: string;
  type: string;        // "easy" | "intermediate" | "scenario"
  tier: number;
  difficulty: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string;
}

interface ProgressEntry {
  topicId: string;
  masteryPercent: number;
  currentTier: number;
  weakFlag: boolean;
}

export interface ScheduleBlock {
  id: string;
  label: string;
  description: string;
  minutes: number;
  cardIds: string[];
  tierLabel: string;      // e.g. "T1-T2" or "T1-T4"
  topicBreakdown: { topicId: string; count: number }[];
}

export interface DailyPlan {
  blocks: ScheduleBlock[];
  totalMinutes: number;
  totalCards: number;
  generatedAt: string;
}

// Time estimates per card type (seconds)
const TIME_EST: Record<string, number> = {
  easy: 30,
  intermediate: 60,
  scenario: 120,
};
const BRANCHING_TIME = 180; // Tier 4

function cardTime(card: SchedulerCard): number {
  if (card.tier === 4) return BRANCHING_TIME;
  return TIME_EST[card.type] ?? 60;
}

function fillBlock(
  pool: SchedulerCard[],
  maxSeconds: number,
  used: Set<string>,
): SchedulerCard[] {
  const selected: SchedulerCard[] = [];
  let elapsed = 0;
  for (const card of pool) {
    if (used.has(card.cardId)) continue;
    const t = cardTime(card);
    if (elapsed + t > maxSeconds) continue;
    selected.push(card);
    used.add(card.cardId);
    elapsed += t;
  }
  return selected;
}

function topicBreakdown(cards: SchedulerCard[]): { topicId: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const c of cards) {
    map[c.topicId] = (map[c.topicId] ?? 0) + 1;
  }
  return Object.entries(map).map(([topicId, count]) => ({ topicId, count }));
}

function tierRange(cards: SchedulerCard[]): string {
  if (cards.length === 0) return "";
  const tiers = [...new Set(cards.map((c) => c.tier))].sort();
  if (tiers.length === 1) return `T${tiers[0]}`;
  return `T${tiers[0]}-T${tiers[tiers.length - 1]}`;
}

export function generateDailyPlan(
  allCards: SchedulerCard[],
  progress: ProgressEntry[],
): DailyPlan {
  const today = new Date().toISOString().split("T")[0];
  const used = new Set<string>();

  // Filter to unlocked-tier cards only
  const unlocked = allCards.filter((c) => {
    const tp = progress.find((p) => p.topicId === c.topicId);
    return tp ? c.tier <= tp.currentTier : c.tier === 1;
  });

  // Due cards (dueDate <= today)
  const dueAll = unlocked
    .filter((c) => c.dueDate <= today)
    .sort((a, b) => {
      // Overdue first
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      // Highest difficulty first
      return b.difficulty - a.difficulty;
    });

  // Weak topics (below 85%)
  const weakTopicIds = new Set(progress.filter((p) => p.weakFlag).map((p) => p.topicId));

  // ── Block 1: Weak Topic Forcing (20 min) ──
  // 2x allocation for topics below 85%. Pull due cards from weak topics first.
  const weakDue = dueAll.filter((c) => weakTopicIds.has(c.topicId));
  const weakNew = unlocked
    .filter((c) => weakTopicIds.has(c.topicId) && c.repetitions === 0)
    .sort((a, b) => b.difficulty - a.difficulty);
  const weakPool = [...weakDue, ...weakNew];
  const block1Cards = fillBlock(weakPool, 20 * 60, used);

  // ── Block 2: Due Review (20 min) ──
  // Mixed topics, overdue cards. Skip cards already used in Block 1.
  const block2Cards = fillBlock(dueAll, 20 * 60, used);

  // ── Block 3: New Cards (15 min) ──
  // From highest unlocked tier per topic. Prioritize weak topics.
  const newPool: SchedulerCard[] = [];
  // Weak topics first, then rest
  const topicOrder = [
    ...TOPICS.filter((t) => weakTopicIds.has(t.id)),
    ...TOPICS.filter((t) => !weakTopicIds.has(t.id)),
  ];
  for (const topic of topicOrder) {
    const tp = progress.find((p) => p.topicId === topic.id);
    const maxTier = tp?.currentTier ?? 1;
    const topicNew = unlocked
      .filter((c) => c.topicId === topic.id && c.repetitions === 0 && c.tier <= maxTier)
      .sort((a, b) => b.tier - a.tier); // Highest unlocked tier first
    newPool.push(...topicNew);
  }
  const block3Cards = fillBlock(newPool, 15 * 60, used);

  // ── Block 4: Lightning Round (5 min) ──
  // Rapid-fire easy cards. Due or new, any topic.
  const easyPool = unlocked
    .filter((c) => c.type === "easy")
    .sort((a, b) => {
      const aDue = a.dueDate <= today ? 1 : 0;
      const bDue = b.dueDate <= today ? 1 : 0;
      if (bDue !== aDue) return bDue - aDue;
      return a.easeFactor - b.easeFactor; // Harder ease first
    });
  const block4Cards = fillBlock(easyPool, 5 * 60, used);

  // ── Backfill ──
  // If < 60 min of material, add new cards from weak topics + re-drill failed
  const totalSec = [block1Cards, block2Cards, block3Cards, block4Cards]
    .flat()
    .reduce((s, c) => s + cardTime(c), 0);
  const remainingSec = 60 * 60 - totalSec;

  let backfillCards: SchedulerCard[] = [];
  if (remainingSec > 60) {
    // Recently-failed cards (low ease, not already scheduled)
    const failedPool = unlocked
      .filter((c) => c.easeFactor < 2.0 && c.repetitions > 0)
      .sort((a, b) => a.easeFactor - b.easeFactor);
    // New cards from weak topics
    const weakNewBackfill = unlocked
      .filter((c) => weakTopicIds.has(c.topicId) && c.repetitions === 0);
    backfillCards = fillBlock([...failedPool, ...weakNewBackfill], remainingSec, used);
  }

  // ── Assemble blocks ──
  const blocks: ScheduleBlock[] = [];

  if (block1Cards.length > 0) {
    const mins = Math.ceil(block1Cards.reduce((s, c) => s + cardTime(c), 0) / 60);
    blocks.push({
      id: "block-1-weak",
      label: "Weak Topic Focus",
      description: `2x priority on topics below 85% — ${weakTopicIds.size} weak topic${weakTopicIds.size !== 1 ? "s" : ""}`,
      minutes: mins,
      cardIds: block1Cards.map((c) => c.cardId),
      tierLabel: tierRange(block1Cards),
      topicBreakdown: topicBreakdown(block1Cards),
    });
  }

  if (block2Cards.length > 0) {
    const mins = Math.ceil(block2Cards.reduce((s, c) => s + cardTime(c), 0) / 60);
    blocks.push({
      id: "block-2-due",
      label: "Due Review",
      description: "Mixed topics, overdue cards first",
      minutes: mins,
      cardIds: block2Cards.map((c) => c.cardId),
      tierLabel: tierRange(block2Cards),
      topicBreakdown: topicBreakdown(block2Cards),
    });
  }

  if (block3Cards.length > 0) {
    const mins = Math.ceil(block3Cards.reduce((s, c) => s + cardTime(c), 0) / 60);
    blocks.push({
      id: "block-3-new",
      label: "New Cards",
      description: "Fresh material from highest unlocked tier",
      minutes: mins,
      cardIds: block3Cards.map((c) => c.cardId),
      tierLabel: tierRange(block3Cards),
      topicBreakdown: topicBreakdown(block3Cards),
    });
  }

  if (block4Cards.length > 0) {
    const mins = Math.ceil(block4Cards.reduce((s, c) => s + cardTime(c), 0) / 60);
    blocks.push({
      id: "block-4-lightning",
      label: "Lightning Round",
      description: "Rapid-fire easy cards",
      minutes: mins,
      cardIds: block4Cards.map((c) => c.cardId),
      tierLabel: tierRange(block4Cards),
      topicBreakdown: topicBreakdown(block4Cards),
    });
  }

  if (backfillCards.length > 0) {
    const mins = Math.ceil(backfillCards.reduce((s, c) => s + cardTime(c), 0) / 60);
    blocks.push({
      id: "block-5-backfill",
      label: "Backfill",
      description: "Re-drill failed cards + new cards from weak topics",
      minutes: mins,
      cardIds: backfillCards.map((c) => c.cardId),
      tierLabel: tierRange(backfillCards),
      topicBreakdown: topicBreakdown(backfillCards),
    });
  }

  const allScheduled = blocks.flatMap((b) => b.cardIds);

  return {
    blocks,
    totalMinutes: blocks.reduce((s, b) => s + b.minutes, 0),
    totalCards: allScheduled.length,
    generatedAt: new Date().toISOString(),
  };
}
