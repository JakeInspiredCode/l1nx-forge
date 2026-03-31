"use client";

import { useState, useMemo, useEffect } from "react";
import { TOPICS } from "@/lib/types";
import { DailyPlan, ScheduleBlock, PlanDifficulty } from "@/lib/forge/scheduler";

interface DailyPlanDisplayProps {
  plan: DailyPlan | null;
  onStartTraining: (cardIds: string[]) => void;
  topicFilter: string;
  onTopicFilterChange: (topic: string) => void;
  difficulty: PlanDifficulty;
  onDifficultyChange: (d: PlanDifficulty) => void;
  onResetPlan: () => void;
}

const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  "block-1-warmup":        { bg: "bg-yellow-500/8",  border: "border-yellow-500/25",  text: "text-yellow-400",  bar: "bg-yellow-500/40" },
  "block-2-easy-review":   { bg: "bg-sky-500/8",     border: "border-sky-500/25",     text: "text-sky-400",     bar: "bg-sky-500/40" },
  "block-3-weak-easy":     { bg: "bg-orange-500/8",  border: "border-orange-500/25",  text: "text-orange-400",  bar: "bg-orange-500/40" },
  "block-4-weak-harder":   { bg: "bg-red-500/8",     border: "border-red-500/25",     text: "text-red-400",     bar: "bg-red-500/40" },
  "block-5-due-remaining": { bg: "bg-blue-500/8",    border: "border-blue-500/25",    text: "text-blue-400",    bar: "bg-blue-500/40" },
  "block-6-new-easy":      { bg: "bg-emerald-500/8", border: "border-emerald-500/25", text: "text-emerald-400", bar: "bg-emerald-500/40" },
  "block-7-new-mixed":     { bg: "bg-purple-500/8",  border: "border-purple-500/25",  text: "text-purple-400",  bar: "bg-purple-500/40" },
  "block-8-cooldown":      { bg: "bg-teal-500/8",    border: "border-teal-500/25",    text: "text-teal-400",    bar: "bg-teal-500/40" },
  "block-9-backfill":      { bg: "bg-forge-surface-2", border: "border-forge-border",  text: "text-forge-text-dim", bar: "bg-forge-text-muted/20" },
};

const DEFAULT_COLORS = BLOCK_COLORS["block-9-backfill"];

const DONE_KEY = "l1nx-plan-done";

interface DoneState {
  ids: Set<string>;
  cardsByBlock: Record<string, string[]>;
}

function loadDone(): DoneState {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    if (!raw) return { ids: new Set(), cardsByBlock: {} };
    const parsed = JSON.parse(raw);
    if (parsed.date !== new Date().toISOString().split("T")[0]) return { ids: new Set(), cardsByBlock: {} };
    return { ids: new Set(parsed.ids as string[]), cardsByBlock: parsed.cardsByBlock ?? {} };
  } catch { return { ids: new Set(), cardsByBlock: {} }; }
}

function saveDone(state: DoneState) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify({
      date: new Date().toISOString().split("T")[0],
      ids: [...state.ids],
      cardsByBlock: state.cardsByBlock,
    }));
  } catch {}
}

function BlockCard({
  block,
  selected,
  done,
  onToggle,
  onStart,
  onRetake,
}: {
  block: ScheduleBlock;
  selected: boolean;
  done: boolean;
  onToggle: () => void;
  onStart: () => void;
  onRetake: () => void;
}) {
  const colors = BLOCK_COLORS[block.id] ?? DEFAULT_COLORS;
  const topicNames = block.topicBreakdown
    .map((tb) => {
      const name = TOPICS.find((t) => t.id === tb.topicId)?.name.split(" ")[0] ?? tb.topicId;
      return `${name} (${tb.count})`;
    })
    .join(", ");

  return (
    <div
      className={`
        rounded-lg px-4 py-3 transition-all duration-150 cursor-pointer
        border-2
        ${done
          ? "opacity-60 bg-forge-surface-2 border-forge-border"
          : selected
            ? `${colors.bg} ${colors.border} ring-1 ring-offset-0 ring-current ${colors.text}`
            : `bg-forge-surface border-forge-border hover:${colors.border}`
        }
      `}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {/* Color dot */}
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.bar}`} />
          <span className={`text-sm font-semibold ${done ? "line-through text-forge-text-muted" : colors.text}`}>
            {block.label}
          </span>
          {block.tierLabel && (
            <span className="text-[10px] mono text-forge-text-muted bg-forge-surface-2 px-1.5 py-0.5 rounded">
              {block.tierLabel}
            </span>
          )}
          {done && <span className="text-[10px] mono text-forge-success">DONE</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs mono text-forge-text-dim">{block.minutes}m — {block.cardIds.length} cards</span>
          {!done && (
            <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
              selected ? `${colors.border} ${colors.text}` : "border-forge-border text-transparent"
            }`}>
              {selected ? "✓" : ""}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-forge-text-muted ml-4.5 pl-0.5">{block.description}</p>
      <p className="text-[11px] text-forge-text-muted mt-1 mono ml-4.5 pl-0.5">{topicNames}</p>

      {/* Per-block action buttons */}
      <div className="flex gap-2 mt-2 ml-4.5 pl-0.5" onClick={(e) => e.stopPropagation()}>
        {!done && (
          <button
            onClick={onStart}
            className={`text-[11px] mono px-2 py-1 rounded-md transition-colors ${colors.bg} ${colors.text} hover:opacity-80 border ${colors.border}`}
          >
            ▶ Start this block
          </button>
        )}
        {done && (
          <button
            onClick={onRetake}
            className="text-[11px] mono px-2 py-1 rounded-md transition-colors bg-forge-surface border border-forge-border text-forge-text-dim hover:text-forge-text"
          >
            ↻ Retake
          </button>
        )}
      </div>
    </div>
  );
}

const DIFFICULTY_LABELS: Record<PlanDifficulty, { label: string; desc: string }> = {
  light: { label: "Light", desc: "~30 min" },
  standard: { label: "Standard", desc: "~60 min" },
  intense: { label: "Intense", desc: "~90 min" },
};

export default function DailyPlanDisplay({ plan, onStartTraining, topicFilter, onTopicFilterChange, difficulty, onDifficultyChange, onResetPlan }: DailyPlanDisplayProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [doneState, setDoneState] = useState<DoneState>({ ids: new Set(), cardsByBlock: {} });

  // Load completed blocks from localStorage on mount
  useEffect(() => {
    setDoneState(loadDone());
  }, []);

  const done = doneState.ids;

  if (!plan || plan.blocks.length === 0) {
    return (
      <div className="bg-forge-surface border border-forge-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Today&apos;s Training Plan</h3>
          <select
            value={topicFilter}
            onChange={(e) => onTopicFilterChange(e.target.value)}
            className="bg-forge-surface-2 border border-forge-border rounded-lg px-2 py-1 text-xs text-forge-text mono outline-none focus:border-forge-accent/50"
          >
            <option value="all">All Topics</option>
            {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <p className="text-sm text-forge-text-dim">No cards available for scheduling. Study new cards to build your queue.</p>
      </div>
    );
  }

  const totalMin = plan.totalMinutes || 1;
  const pendingBlocks = plan.blocks.filter((b) => !done.has(b.id));
  const doneCount = plan.blocks.filter((b) => done.has(b.id)).length;

  const toggleBlock = (id: string) => {
    if (done.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCards = plan.blocks
    .filter((b) => selected.has(b.id))
    .flatMap((b) => b.cardIds);

  const selectedMinutes = plan.blocks
    .filter((b) => selected.has(b.id))
    .reduce((s, b) => s + b.minutes, 0);

  const markDone = (blockId: string, cardIds: string[]) => {
    const nextIds = new Set(done);
    nextIds.add(blockId);
    const nextCards = { ...doneState.cardsByBlock, [blockId]: cardIds };
    const next: DoneState = { ids: nextIds, cardsByBlock: nextCards };
    setDoneState(next);
    saveDone(next);
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(blockId);
      return n;
    });
  };

  const handleStartSelected = () => {
    if (selectedCards.length === 0) return;
    const startedBlockIds = [...selected];
    onStartTraining(selectedCards);
    for (const id of startedBlockIds) {
      const block = plan.blocks.find((b) => b.id === id);
      if (block) markDone(id, block.cardIds);
    }
  };

  const handleStartSingle = (block: ScheduleBlock) => {
    onStartTraining(block.cardIds);
    markDone(block.id, block.cardIds);
  };

  const handleRetake = (block: ScheduleBlock) => {
    // Use the stashed card IDs from when the block was originally completed
    const stashedCards = doneState.cardsByBlock[block.id];
    onStartTraining(stashedCards ?? block.cardIds);
  };

  const selectAll = () => {
    setSelected(new Set(pendingBlocks.map((b) => b.id)));
  };

  const selectNone = () => {
    setSelected(new Set());
  };

  return (
    <div className="bg-forge-surface border border-forge-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold">Today&apos;s Training Plan</h3>
          <p className="text-xs text-forge-text-dim mt-0.5">
            {plan.totalCards} cards — ~{plan.totalMinutes} min
            {doneCount > 0 && (
              <span className="text-forge-success ml-2">
                {doneCount}/{plan.blocks.length} blocks done
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty toggle */}
          <div className="flex rounded-lg overflow-hidden border border-forge-border">
            {(["light", "standard", "intense"] as PlanDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                className={`text-[11px] mono px-2.5 py-1 transition-colors ${
                  difficulty === d
                    ? "bg-forge-accent/20 text-forge-accent"
                    : "bg-forge-surface-2 text-forge-text-dim hover:text-forge-text"
                }`}
                title={DIFFICULTY_LABELS[d].desc}
              >
                {DIFFICULTY_LABELS[d].label}
              </button>
            ))}
          </div>
          <select
            value={topicFilter}
            onChange={(e) => onTopicFilterChange(e.target.value)}
            className="bg-forge-surface-2 border border-forge-border rounded-lg px-2 py-1 text-xs text-forge-text mono outline-none focus:border-forge-accent/50"
          >
            <option value="all">All Topics</option>
            {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={selectAll}
            className="text-[11px] mono px-2 py-1 rounded bg-forge-surface-2 text-forge-text-dim hover:text-forge-text transition-colors">
            Select all
          </button>
          <button onClick={selectNone}
            className="text-[11px] mono px-2 py-1 rounded bg-forge-surface-2 text-forge-text-dim hover:text-forge-text transition-colors">
            Clear
          </button>
          <button onClick={onResetPlan}
            className="text-[11px] mono px-2 py-1 rounded bg-forge-surface-2 text-forge-danger/80 hover:text-forge-danger transition-colors border border-forge-border"
            title="Reset today's plan — clears all block progress and regenerates"
          >
            Reset Plan
          </button>
        </div>
      </div>

      {/* Visual time bar — color-coded */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-forge-surface-2">
        {plan.blocks.map((block) => {
          const colors = BLOCK_COLORS[block.id] ?? DEFAULT_COLORS;
          const widthPct = Math.max(4, (block.minutes / totalMin) * 100);
          const isDone = done.has(block.id);
          return (
            <div
              key={block.id}
              className={`transition-all duration-300 ${isDone ? "bg-forge-success/30" : colors.bar} ${
                selected.has(block.id) ? "opacity-100" : "opacity-50"
              }`}
              style={{ width: `${widthPct}%` }}
              title={`${block.label}: ${block.minutes}m${isDone ? " (done)" : ""}`}
            />
          );
        })}
      </div>

      {/* Block cards */}
      <div className="space-y-2 mb-4">
        {plan.blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            selected={selected.has(block.id)}
            done={done.has(block.id)}
            onToggle={() => toggleBlock(block.id)}
            onStart={() => handleStartSingle(block)}
            onRetake={() => handleRetake(block)}
          />
        ))}
      </div>

      {/* Start selected */}
      {selectedCards.length > 0 && (
        <button
          onClick={handleStartSelected}
          className="w-full py-3 bg-forge-accent text-white rounded-xl font-semibold hover:bg-forge-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          <span>▶</span> Start Selected ({selectedCards.length} cards, ~{selectedMinutes} min)
        </button>
      )}
      {selectedCards.length === 0 && pendingBlocks.length > 0 && (
        <p className="text-center text-xs text-forge-text-muted py-2">
          Click blocks to select, or use the ▶ button on any block to start it individually.
        </p>
      )}
      {pendingBlocks.length === 0 && (
        <div className="text-center py-2">
          <span className="text-sm text-forge-success mono font-semibold">All blocks complete for today!</span>
        </div>
      )}
    </div>
  );
}
