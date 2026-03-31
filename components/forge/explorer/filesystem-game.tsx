"use client";

import { useState, useCallback } from "react";
import { FSNode, FILESYSTEM_TREE, getQuizNodes } from "@/lib/seeds/filesystem-data";

type Mode = "learn" | "label";

interface Props {
  mode: Mode;
  onBack: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Learn Mode: interactive expandable tree ──
function TreeNode({ node, depth }: { node: FSNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={`flex items-center gap-2 py-1 px-2 rounded text-left w-full hover:bg-forge-surface-2 transition-colors ${
          hasChildren ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <span className="text-xs text-forge-text-muted w-4 text-center">
          {hasChildren ? (expanded ? "▾" : "▸") : "·"}
        </span>
        <span className="mono text-sm text-forge-accent">{node.name === "/" ? "/" : node.name}</span>
        <span className="text-xs text-forge-text-dim">{node.description}</span>
      </button>
      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Label Mode: description shown, type the path ──
function LabelGame({ onBack }: { onBack: () => void }) {
  const [quizItems] = useState(() => shuffleArray(getQuizNodes()));
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const item = quizItems[current];
  const isDone = current >= quizItems.length;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!item || feedback) return;
    const norm = input.trim().toLowerCase().replace(/\/+$/, "");
    const target = item.path.toLowerCase().replace(/\/+$/, "");
    const isCorrect = norm === target;

    setFeedback(isCorrect ? "correct" : "wrong");
    setCorrectAnswer(item.path);
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));

    setTimeout(() => {
      setFeedback(null);
      setInput("");
      setCurrent((c) => c + 1);
    }, isCorrect ? 800 : 2000);
  }, [item, input, feedback]);

  if (isDone) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold mono mb-2">Done!</h3>
        <p className="text-forge-text-dim mb-4">
          {score.correct}/{score.total} correct ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)
        </p>
        <button onClick={onBack} className="px-6 py-2 bg-forge-accent text-white rounded-xl">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs mono text-forge-text-dim">{current + 1}/{quizItems.length}</span>
        <span className="text-xs mono text-forge-accent">{score.correct} correct</span>
      </div>

      <div className={`bg-forge-surface border rounded-xl p-6 text-center mb-4 transition-colors ${
        feedback === "correct" ? "border-forge-success/50" :
        feedback === "wrong" ? "border-forge-danger/50" :
        "border-forge-border"
      }`}>
        <p className="text-sm text-forge-text-dim mb-2">What path is this?</p>
        <p className="text-lg font-medium">{item.description}</p>
        {feedback === "wrong" && (
          <p className="mt-3 text-sm text-forge-danger">
            Correct: <span className="mono text-forge-text">{correctAnswer}</span>
          </p>
        )}
      </div>

      {!feedback && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="/path/to/..."
            autoFocus
            autoComplete="off"
            className="w-full bg-forge-surface-2 border border-forge-border rounded-xl px-4 py-3 mono text-center outline-none focus:border-forge-accent/50"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="mt-3 w-full py-3 bg-forge-accent text-white rounded-xl font-medium disabled:opacity-30"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}

export default function FilesystemGame({ mode, onBack }: Props) {
  if (mode === "label") {
    return <LabelGame onBack={onBack} />;
  }

  // Learn mode
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Linux Filesystem Hierarchy</h3>
        <button onClick={onBack} className="text-xs text-forge-text-muted hover:text-forge-text">
          Back
        </button>
      </div>
      <div className="bg-forge-surface border border-forge-border rounded-xl p-4 overflow-auto max-h-[70vh]">
        <TreeNode node={FILESYSTEM_TREE} depth={0} />
      </div>
    </div>
  );
}
