"use client";

import { EvalScore } from "@/lib/forge/evaluator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SelfGradePromptProps {
  expectedAnswer: string;
  userInput: string;
  onGrade: (score: EvalScore) => void;
}

export default function SelfGradePrompt({ expectedAnswer, userInput, onGrade }: SelfGradePromptProps) {
  return (
    <div className="bg-forge-surface border border-forge-border rounded-xl p-5 space-y-4">
      <div>
        <p className="text-xs text-forge-text-dim mono mb-2">You answered:</p>
        <p className="text-sm mono text-forge-text bg-forge-surface-2 px-3 py-2 rounded border border-forge-border/50 min-h-[40px]">
          {userInput || <span className="text-forge-text-muted italic">no answer</span>}
        </p>
      </div>

      <div>
        <p className="text-xs text-forge-text-dim mono mb-2">Expected answer:</p>
        <div className="text-sm bg-forge-surface-2 px-3 py-2 rounded border border-forge-accent/20 markdown-content max-h-[160px] overflow-y-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{expectedAnswer}</ReactMarkdown>
        </div>
      </div>

      <div>
        <p className="text-xs text-forge-text-dim mono mb-3">How did you do?</p>
        <div className="flex gap-2">
          <button
            onClick={() => onGrade("correct")}
            className="flex-1 py-2 rounded-lg border text-sm font-medium mono transition-colors
              bg-forge-success/15 text-forge-success border-forge-success/30 hover:bg-forge-success/25"
          >
            Nailed It
          </button>
          <button
            onClick={() => onGrade("partial")}
            className="flex-1 py-2 rounded-lg border text-sm font-medium mono transition-colors
              bg-forge-warning/15 text-forge-warning border-forge-warning/30 hover:bg-forge-warning/25"
          >
            Close
          </button>
          <button
            onClick={() => onGrade("wrong")}
            className="flex-1 py-2 rounded-lg border text-sm font-medium mono transition-colors
              bg-forge-danger/15 text-forge-danger border-forge-danger/30 hover:bg-forge-danger/25"
          >
            Missed It
          </button>
        </div>
      </div>
    </div>
  );
}
