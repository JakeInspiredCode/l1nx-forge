"use client";

import { TOPICS } from "@/lib/types";

interface ProgressEntry {
  topicId: string;
  masteryPercent: number;
  currentTier: number;
  newCards: number;
  weakFlag: boolean;
  lastUpdated: string;
  [key: string]: unknown;
}

interface DailyBriefingProps {
  progress: ProgressEntry[];
  dueCount: number;
  totalCards: number;
}

function generateInsight(progress: ProgressEntry[], dueCount: number, totalCards: number): string {
  if (totalCards === 0) return "No cards loaded yet. Seed data will import on first load.";
  if (progress.length === 0) return "Start reviewing to build your readiness profile.";

  // Find weakest topic
  const weakTopics = progress.filter((p) => p.weakFlag);
  const sorted = [...progress].sort((a, b) => a.masteryPercent - b.masteryPercent);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  // Check for stale topics (not updated in 2+ days)
  const today = new Date();
  const staleTopics = progress.filter((p) => {
    if (!p.lastUpdated) return false;
    const updated = new Date(p.lastUpdated);
    const diffDays = Math.floor((today.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 2;
  });

  // Priority: stale topic warning > weak topic > high due count > encouragement
  if (staleTopics.length > 0) {
    const stale = staleTopics[0];
    const name = TOPICS.find((t) => t.id === stale.topicId)?.name.split(" ")[0] ?? stale.topicId;
    const days = Math.floor((today.getTime() - new Date(stale.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    return `${name} hasn't been reviewed in ${days} days — that topic is drifting.`;
  }

  if (weakTopics.length >= 3) {
    return `${weakTopics.length} topics below 85% mastery. Focus weak areas before mock interviews.`;
  }

  if (weakest && weakest.masteryPercent < 50) {
    const name = TOPICS.find((t) => t.id === weakest.topicId)?.name.split(" ")[0] ?? weakest.topicId;
    return `${name} is at ${weakest.masteryPercent}% — prioritize this topic today.`;
  }

  if (dueCount > 40) {
    return `${dueCount} cards due — consider a longer session today to stay on schedule.`;
  }

  if (strongest && strongest.masteryPercent >= 90) {
    const name = TOPICS.find((t) => t.id === strongest.topicId)?.name.split(" ")[0] ?? strongest.topicId;
    if (weakest && weakest.masteryPercent < 85) {
      const weakName = TOPICS.find((t) => t.id === weakest.topicId)?.name.split(" ")[0] ?? weakest.topicId;
      return `${name} is strong at ${strongest.masteryPercent}%. Shift focus to ${weakName} (${weakest.masteryPercent}%).`;
    }
    return `${name} leads at ${strongest.masteryPercent}%. Solid foundation building.`;
  }

  if (dueCount === 0) {
    return "All caught up on reviews. Good time to learn new cards or run a mock interview.";
  }

  return `${dueCount} cards due today across ${new Set(progress.map(p => p.topicId)).size} topics. Keep building.`;
}

export default function DailyBriefing({ progress, dueCount, totalCards }: DailyBriefingProps) {
  const insight = generateInsight(progress, dueCount, totalCards);

  return (
    <div className="bg-forge-surface-2 border border-forge-border/50 rounded-xl px-5 py-3 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-forge-accent mono text-sm">///</span>
        <p className="text-sm text-forge-text-dim leading-relaxed">{insight}</p>
      </div>
    </div>
  );
}
