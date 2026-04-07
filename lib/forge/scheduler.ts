// ═══════════════════════════════════════
// Daily Scheduler — Gentle-ramp edition
// 8 short blocks, easiest-first within each
// ═══════════════════════════════════════

import { TOPICS } from "../types";

interface SchedulerCard {
  cardId: string;
  topicId: string;
  type: string;
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
  blockType: "cards" | "activity";
  // Card block fields
  cardIds: string[];
  tierLabel: string;
  topicBreakdown: { topicId: string; count: number }[];
  // Activity block fields
  activityType?: string;
  link?: string;
}

export interface DailyPlan {
  blocks: ScheduleBlock[];
  totalMinutes: number;
  totalCards: number;
  generatedAt: string;
}

const TIME_EST: Record<string, number> = {
  easy: 30,
  intermediate: 60,
  scenario: 120,
};
const BRANCHING_TIME = 180;

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

// Sort easiest-first: low difficulty, easy type, low tier
function easyFirst(a: SchedulerCard, b: SchedulerCard): number {
  if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
  const typeOrder: Record<string, number> = { easy: 0, intermediate: 1, scenario: 2 };
  const ta = typeOrder[a.type] ?? 1;
  const tb = typeOrder[b.type] ?? 1;
  if (ta !== tb) return ta - tb;
  return a.tier - b.tier;
}

function addBlock(
  blocks: ScheduleBlock[],
  id: string,
  label: string,
  description: string,
  cards: SchedulerCard[],
) {
  if (cards.length === 0) return;
  const mins = Math.ceil(cards.reduce((s, c) => s + cardTime(c), 0) / 60);
  blocks.push({
    id,
    label,
    description,
    minutes: mins,
    blockType: "cards",
    cardIds: cards.map((c) => c.cardId),
    tierLabel: tierRange(cards),
    topicBreakdown: topicBreakdown(cards),
  });
}

function addActivityBlock(
  blocks: ScheduleBlock[],
  id: string,
  label: string,
  description: string,
  minutes: number,
  activityType: string,
  link: string,
) {
  blocks.push({
    id,
    label,
    description,
    minutes,
    blockType: "activity",
    cardIds: [],
    tierLabel: "",
    topicBreakdown: [],
    activityType,
    link,
  });
}

export type PlanDifficulty = "light" | "standard" | "intense";

const PLAN_MINUTES: Record<PlanDifficulty, number> = {
  light: 30,
  standard: 60,
  intense: 90,
};

// Block time budgets scale proportionally with total plan minutes
function blockBudgets(totalMin: number) {
  const ratio = totalMin / 60;
  return {
    warmup: Math.round(5 * ratio),
    easyReview: Math.round(10 * ratio),
    weakEasy: Math.round(8 * ratio),
    weakHarder: Math.round(8 * ratio),
    dueRemaining: Math.round(8 * ratio),
    newEasy: Math.round(5 * ratio),
    newMixed: Math.round(5 * ratio),
    coolDown: Math.round(5 * ratio),
  };
}

export function generateDailyPlan(
  allCards: SchedulerCard[],
  progress: ProgressEntry[],
  topicFilter?: string,
  difficulty: PlanDifficulty = "standard",
): DailyPlan {
  const today = new Date().toISOString().split("T")[0];
  const used = new Set<string>();
  const targetMinutes = PLAN_MINUTES[difficulty];
  const budgets = blockBudgets(targetMinutes);

  // Unlocked-tier cards only, optionally filtered to a single topic
  const unlocked = allCards.filter((c) => {
    if (topicFilter && topicFilter !== "all" && c.topicId !== topicFilter) return false;
    const tp = progress.find((p) => p.topicId === c.topicId);
    return tp ? c.tier <= tp.currentTier : c.tier === 1;
  });

  // Due cards sorted easiest-first
  const dueAll = unlocked
    .filter((c) => c.dueDate <= today)
    .sort(easyFirst);

  const weakTopicIds = new Set(progress.filter((p) => p.weakFlag).map((p) => p.topicId));

  // ── Block 1: Warm-Up ──
  const warmUpPool = dueAll.filter((c) => c.type === "easy");
  const block1 = fillBlock(warmUpPool, budgets.warmup * 60, used);

  // ── Block 2: Easy Review ──
  const easyReviewPool = dueAll
    .filter((c) => c.type === "easy" || c.type === "intermediate")
    .sort(easyFirst);
  const block2 = fillBlock(easyReviewPool, budgets.easyReview * 60, used);

  // ── Block 3: Weak Topics — Easy ──
  const weakEasyPool = unlocked
    .filter((c) => weakTopicIds.has(c.topicId) && (c.type === "easy" || c.type === "intermediate") && c.difficulty <= 2)
    .sort(easyFirst);
  const block3 = fillBlock(weakEasyPool, budgets.weakEasy * 60, used);

  // ── Block 4: Weak Topics — Harder ──
  const weakHarderPool = unlocked
    .filter((c) => weakTopicIds.has(c.topicId))
    .sort(easyFirst);
  const block4 = fillBlock(weakHarderPool, budgets.weakHarder * 60, used);

  // ── Block 5: Due Review — Remaining ──
  const block5 = fillBlock(dueAll, budgets.dueRemaining * 60, used);

  // ── Block 6: New Cards — Easy (5 min) ──
  // New easy cards, weak topics first
  const topicOrder = [
    ...TOPICS.filter((t) => weakTopicIds.has(t.id)),
    ...TOPICS.filter((t) => !weakTopicIds.has(t.id)),
  ];
  const newEasyPool: SchedulerCard[] = [];
  for (const topic of topicOrder) {
    const tp = progress.find((p) => p.topicId === topic.id);
    const maxTier = tp?.currentTier ?? 1;
    const topicNew = unlocked
      .filter((c) => c.topicId === topic.id && c.repetitions === 0 && c.tier <= maxTier && (c.type === "easy" || c.difficulty <= 1))
      .sort(easyFirst);
    newEasyPool.push(...topicNew);
  }
  const block6 = fillBlock(newEasyPool, budgets.newEasy * 60, used);

  // ── Block 7: New Cards — Mixed (5 min) ──
  // New intermediate/scenario cards
  const newMixedPool: SchedulerCard[] = [];
  for (const topic of topicOrder) {
    const tp = progress.find((p) => p.topicId === topic.id);
    const maxTier = tp?.currentTier ?? 1;
    const topicNew = unlocked
      .filter((c) => c.topicId === topic.id && c.repetitions === 0 && c.tier <= maxTier)
      .sort(easyFirst);
    newMixedPool.push(...topicNew);
  }
  const block7 = fillBlock(newMixedPool, budgets.newMixed * 60, used);

  // ── Block 8: Cool Down (5 min) ──
  // Quick easy cards to end on a high note
  const coolDownPool = unlocked
    .filter((c) => c.type === "easy")
    .sort(easyFirst);
  const block8 = fillBlock(coolDownPool, budgets.coolDown * 60, used);

  // ── Backfill (remaining time up to 60 min) ──
  const allBlocks = [block1, block2, block3, block4, block5, block6, block7, block8];
  const totalSec = allBlocks.flat().reduce((s, c) => s + cardTime(c), 0);
  const remainingSec = targetMinutes * 60 - totalSec;

  let backfillCards: SchedulerCard[] = [];
  if (remainingSec > 60) {
    const failedPool = unlocked
      .filter((c) => c.easeFactor < 2.0 && c.repetitions > 0)
      .sort(easyFirst);
    const weakNewBackfill = unlocked
      .filter((c) => weakTopicIds.has(c.topicId) && c.repetitions === 0)
      .sort(easyFirst);
    backfillCards = fillBlock([...failedPool, ...weakNewBackfill], remainingSec, used);
  }

  // ── Assemble ──
  const blocks: ScheduleBlock[] = [];

  addBlock(blocks, "block-1-warmup", "Warm-Up", "Easy cards to get started", block1);
  addBlock(blocks, "block-2-easy-review", "Easy Review", "Due easy & intermediate cards", block2);
  addBlock(blocks, "block-3-weak-easy", "Weak Topics — Easy",
    `Gentle ramp on ${weakTopicIds.size} weak topic${weakTopicIds.size !== 1 ? "s" : ""}`, block3);
  addBlock(blocks, "block-4-weak-harder", "Weak Topics — Mixed",
    "Stepping up difficulty on weak areas", block4);
  addBlock(blocks, "block-5-due-remaining", "Due Review", "Remaining overdue cards", block5);
  addBlock(blocks, "block-6-new-easy", "New Cards — Easy", "Fresh easy material", block6);
  addBlock(blocks, "block-7-new-mixed", "New Cards — Mixed", "Fresh intermediate & scenario cards", block7);
  addBlock(blocks, "block-8-cooldown", "Cool Down", "Quick easy cards to end strong", block8);
  addBlock(blocks, "block-9-backfill", "Backfill", "Re-drill struggled cards + new weak-topic cards", backfillCards);

  // ── Activity Recommendations (1-2 per plan) ──
  const activities: { id: string; label: string; desc: string; mins: number; type: string; link: string }[] = [];
  const linuxProgress = progress.find((p) => p.topicId === "linux");
  const linuxTier = linuxProgress?.currentTier ?? 1;

  // Recommend foundations if user is in Linux T1
  if (linuxTier <= 1) {
    activities.push({
      id: "activity-foundations", label: "Read: Linux Foundations",
      desc: "Build core concepts in the interactive guide", mins: 10,
      type: "foundations", link: "/foundations",
    });
  }

  // Recommend terminal sim for Linux T1 users
  if (linuxTier <= 2) {
    activities.push({
      id: "activity-terminal", label: "Explore the Terminal Simulator",
      desc: "Practice commands in a simulated DC environment", mins: 5,
      type: "terminal", link: "/terminal",
    });
  }

  // Recommend quick draw if there are weak topics
  if (weakTopicIds.size > 0) {
    const weakNames = [...weakTopicIds].slice(0, 2);
    activities.push({
      id: "activity-quick-draw", label: "Quick Draw — Sharpen Recall",
      desc: `Fast recall on weak areas: ${weakNames.join(", ")}`, mins: 5,
      type: "quick-draw", link: "/train/quick-draw",
    });
  }

  // Recommend diagnosis lab for T2+ users
  if (linuxTier >= 2) {
    activities.push({
      id: "activity-diagnosis", label: "Diagnosis Lab",
      desc: "Practice troubleshooting a real scenario", mins: 10,
      type: "diagnosis", link: "/train/diagnosis",
    });
  }

  // Recommend boot process for Linux T1-T2
  if (linuxTier <= 2) {
    activities.push({
      id: "activity-boot", label: "Boot Process Explorer",
      desc: "Review the Linux boot sequence or try a triage", mins: 5,
      type: "boot-process", link: "/explore/boot-process",
    });
  }

  // Insert up to 2 activities: one after block 2 (easy review), one before cooldown
  const picked = activities.slice(0, 2);
  if (picked.length > 0) {
    // Find insertion point: after the 2nd block (or end if fewer)
    const insertAfter = Math.min(2, blocks.length);
    addActivityBlock([], "", "", "", 0, "", ""); // unused — just for type; actual insertion below
    // Remove dummy, insert real activities
    const act1 = picked[0];
    const actBlock1: ScheduleBlock = {
      id: act1.id, label: act1.label, description: act1.desc, minutes: act1.mins,
      blockType: "activity", cardIds: [], tierLabel: "", topicBreakdown: [],
      activityType: act1.type, link: act1.link,
    };
    blocks.splice(insertAfter, 0, actBlock1);

    if (picked.length > 1) {
      const act2 = picked[1];
      // Insert before the last block
      const insertBefore = Math.max(blocks.length - 1, insertAfter + 1);
      const actBlock2: ScheduleBlock = {
        id: act2.id, label: act2.label, description: act2.desc, minutes: act2.mins,
        blockType: "activity", cardIds: [], tierLabel: "", topicBreakdown: [],
        activityType: act2.type, link: act2.link,
      };
      blocks.splice(insertBefore, 0, actBlock2);
    }
  }

  const allScheduled = blocks.flatMap((b) => b.cardIds);

  return {
    blocks,
    totalMinutes: blocks.reduce((s, b) => s + b.minutes, 0),
    totalCards: allScheduled.length,
    generatedAt: new Date().toISOString(),
  };
}
