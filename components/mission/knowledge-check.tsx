"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@/lib/convex-shim";
import { api } from "@/convex/_generated/api";
import type { KnowledgeCheck, KnowledgeCheckItem } from "@/lib/types/campaign";
import HexPanel from "@/components/ui/hex-panel";
import TelemetryBar from "@/components/ui/telemetry-bar";
import ActionButton from "@/components/ui/action-button";

interface KnowledgeCheckProps {
  check: KnowledgeCheck;
  onComplete: (passed: boolean, score: number, total: number) => void;
}

function CardQuestion({
  item,
  revealed,
  lastAnswer,
  onReveal,
  onAnswer,
}: {
  item: KnowledgeCheckItem;
  revealed: boolean;
  lastAnswer: "correct" | "wrong" | null;
  onReveal: () => void;
  onAnswer: (correct: boolean) => void;
}) {
  const card = useQuery(api.forgeCards.getByCardId, { cardId: item.contentRef });

  return (
    <>
      <HexPanel
        glow={lastAnswer !== null}
        glowColor={lastAnswer === "correct" ? "success" : lastAnswer === "wrong" ? "danger" : "cyan"}
      >
        <div className="py-6">
          <p className="text-xs text-v2-text-muted uppercase tracking-wider mb-3 text-center">
            {item.type === "flashcard" ? "Flashcard" : item.type === "quick-draw" ? "Quick Recall" : "Multiple Choice"}
          </p>

          {/* Question */}
          <div className="text-center mb-4">
            {card ? (
              <div className="markdown-content text-v2-text text-base">
                {card.front}
              </div>
            ) : (
              <p className="text-v2-text-dim text-sm animate-pulse">Loading card...</p>
            )}
          </div>

          {/* Answer (revealed) */}
          {revealed && card && (
            <div className="border-t border-v2-border pt-4 mt-4">
              <p className="text-xs text-v2-text-muted uppercase tracking-wider mb-2 text-center">Answer</p>
              <div className="markdown-content text-v2-cyan text-sm text-center">
                {card.back}
              </div>
            </div>
          )}
        </div>
      </HexPanel>

      {/* Actions */}
      {!revealed ? (
        <div className="flex justify-center">
          <ActionButton variant="primary" size="md" onClick={onReveal}>
            Reveal Answer
          </ActionButton>
        </div>
      ) : (
        <div className="flex gap-3">
          <ActionButton variant="secondary" size="md" onClick={() => onAnswer(false)} className="flex-1">
            Missed It
          </ActionButton>
          <ActionButton variant="primary" size="md" onClick={() => onAnswer(true)} className="flex-1">
            Got It
          </ActionButton>
        </div>
      )}
    </>
  );
}

export default function KnowledgeCheckScreen({ check, onComplete }: KnowledgeCheckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<"correct" | "wrong" | null>(null);
  const [revealed, setRevealed] = useState(false);

  const total = check.items.length;
  const progress = total > 0 ? (answered / total) * 100 : 0;
  const currentItem = check.items[currentIndex];

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      const newCorrect = correct + (isCorrect ? 1 : 0);
      const newAnswered = answered + 1;

      setCorrect(newCorrect);
      setAnswered(newAnswered);
      setLastAnswer(isCorrect ? "correct" : "wrong");

      setTimeout(() => {
        setLastAnswer(null);
        setRevealed(false);
        if (newAnswered >= total) {
          const passed = (newCorrect / total) >= check.passThreshold;
          setShowResult(true);
          onComplete(passed, newCorrect, total);
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 800);
    },
    [correct, answered, total, check.passThreshold, onComplete]
  );

  if (showResult) {
    const passed = (correct / total) >= check.passThreshold;
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <HexPanel glow glowColor={passed ? "cyan" : "warning"}>
          <div className="py-6">
            <h2 className={`display-font text-2xl mb-2 ${passed ? "text-v2-cyan" : "text-v2-warning"}`}>
              {passed ? "Knowledge Check Passed" : "Not Quite"}
            </h2>
            <p className="text-4xl font-bold glow-text-cyan mb-2">
              {correct} / {total}
            </p>
            <p className="text-sm text-v2-text-dim">
              {passed
                ? "You've demonstrated mastery of this material."
                : `Need ${Math.ceil(check.passThreshold * total)} correct to pass. Review and try again.`}
            </p>
          </div>
        </HexPanel>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-v2-text-dim">
          Question {currentIndex + 1} of {total}
        </span>
        <span className="text-xs mono text-v2-text-dim">
          {correct}/{answered} correct
        </span>
      </div>
      <TelemetryBar value={progress} segments={total} color="cyan" />

      {currentItem && (
        <CardQuestion
          item={currentItem}
          revealed={revealed}
          lastAnswer={lastAnswer}
          onReveal={() => setRevealed(true)}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
