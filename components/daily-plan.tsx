"use client";

import { useMemo } from "react";
import { TOPICS } from "@/lib/types";
import { DailyPlan, ScheduleBlock } from "@/lib/forge/scheduler";

interface DailyPlanDisplayProps {
  plan: DailyPlan | null;
  onStartTraining: (cardIds: string[]) => void;
}

const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "block-1-weak": { bg: "bg-forge-danger/8", border: "border-forge-danger/25", text: "text-forge-danger" },
  "block-2-due": { bg: "bg-forge-accent/8", border: "border-forge-accent/25", text: "text-forge-accent" },
  "block-3-new": { bg: "bg-forge-success/8", border: "border-forge-success/25", text: "text-forge-success" },
  "block-4-lightning": { bg: "bg-forge-warning/8", border: "border-forge-warning/25", text: "text-forge-warning" },
  "block-5-backfill": { bg: "bg-forge-surface-2", border: "border-forge-border", text: "text-forge-text-dim" },
};

function BlockBar({ block }: { block: ScheduleBlock }) {
  const colors = BLOCK_COLORS[block.id] ?? BLOCK_COLORS["block-5-backfill"];
  const topicNames = block.topicBreakdown
    .map((tb) => {
      const name = TOPICS.find((t) => t.id === tb.topicId)?.name.split(" ")[0] ?? tb.topicId;
      return `${name} (${tb.count})`;
    })
    .join(", ");

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg px-4 py-3`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${colors.text}`}>{block.label}</span>
          {block.tierLabel && (
            <span className="text-[10px] mono text-forge-text-muted bg-forge-surface-2 px-1.5 py-0.5 rounded">
              {block.tierLabel}
            </span>
          )}
        </div>
        <span className="text-xs mono text-forge-text-dim">{block.minutes}m — {block.cardIds.length} cards</span>
      </div>
      <p className="text-xs text-forge-text-muted">{block.description}</p>
      <p className="text-[11px] text-forge-text-muted mt-1 mono">{topicNames}</p>
    </div>
  );
}

export default function DailyPlanDisplay({ plan, onStartTraining }: DailyPlanDisplayProps) {
  if (!plan || plan.blocks.length === 0) {
    return (
      <div className="bg-forge-surface border border-forge-border rounded-xl p-6">
        <h3 className="font-semibold mb-2">Today's Training Plan</h3>
        <p className="text-sm text-forge-text-dim">No cards available for scheduling. Study new cards to build your queue.</p>
      </div>
    );
  }

  const allCardIds = plan.blocks.flatMap((b) => b.cardIds);

  // Visual time bar — proportional widths
  const totalMin = plan.totalMinutes || 1;

  return (
    <div className="bg-forge-surface border border-forge-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Today's Training Plan</h3>
          <p className="text-xs text-forge-text-dim mt-0.5">
            {plan.totalCards} cards — ~{plan.totalMinutes} min
          </p>
        </div>
      </div>

      {/* Visual time bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-forge-surface-2">
        {plan.blocks.map((block) => {
          const colors = BLOCK_COLORS[block.id] ?? BLOCK_COLORS["block-5-backfill"];
          const widthPct = Math.max(5, (block.minutes / totalMin) * 100);
          const barColor = block.id === "block-1-weak" ? "bg-forge-danger/40"
            : block.id === "block-2-due" ? "bg-forge-accent/40"
            : block.id === "block-3-new" ? "bg-forge-success/40"
            : block.id === "block-4-lightning" ? "bg-forge-warning/40"
            : "bg-forge-text-muted/20";
          return (
            <div key={block.id} className={`${barColor} transition-all duration-300`}
              style={{ width: `${widthPct}%` }}
              title={`${block.label}: ${block.minutes}m`} />
          );
        })}
      </div>

      {/* Block cards */}
      <div className="space-y-2 mb-4">
        {plan.blocks.map((block) => (
          <BlockBar key={block.id} block={block} />
        ))}
      </div>

      {/* Start Training button */}
      <button
        onClick={() => onStartTraining(allCardIds)}
        className="w-full py-3 bg-forge-accent text-white rounded-xl font-semibold hover:bg-forge-accent/90 transition-colors flex items-center justify-center gap-2"
      >
        <span>▶</span> Start Training ({plan.totalCards} cards, ~{plan.totalMinutes} min)
      </button>
    </div>
  );
}
