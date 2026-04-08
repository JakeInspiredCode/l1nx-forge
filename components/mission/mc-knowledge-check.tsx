"use client";

import { useState, useCallback } from "react";
import type { MCQuestion } from "@/lib/types/campaign";
import HexPanel from "@/components/ui/hex-panel";
import TelemetryBar from "@/components/ui/telemetry-bar";
import ActionButton from "@/components/ui/action-button";

interface MCKnowledgeCheckProps {
  questions: MCQuestion[];
  passThreshold: number;
  onComplete: (passed: boolean, score: number, total: number) => void;
}

export default function MCKnowledgeCheck({
  questions,
  passThreshold,
  onComplete,
}: MCKnowledgeCheckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const total = questions.length;
  const progress = total > 0 ? (answered / total) * 100 : 0;
  const q = questions[currentIndex];

  const handleSelect = (label: string) => {
    if (submitted) return;
    setSelected(label);
  };

  const handleSubmit = useCallback(() => {
    if (!selected || submitted) return;
    setSubmitted(true);
  }, [selected, submitted]);

  const handleNext = useCallback(() => {
    const isCorrect = selected === q.correctAnswer;
    const newCorrect = correct + (isCorrect ? 1 : 0);
    const newAnswered = answered + 1;

    setCorrect(newCorrect);
    setAnswered(newAnswered);

    if (newAnswered >= total) {
      const passed = (newCorrect / total) >= passThreshold;
      setShowResult(true);
      onComplete(passed, newCorrect, total);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }, [selected, q, correct, answered, total, passThreshold, onComplete]);

  // ── Final result screen ──
  if (showResult) {
    const passed = (correct / total) >= passThreshold;
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
                : `Need ${Math.ceil(passThreshold * total)} correct to pass. Review and try again.`}
            </p>
          </div>
        </HexPanel>
      </div>
    );
  }

  // ── Question screen ──
  const isCorrect = selected === q.correctAnswer;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-v2-text-dim">
          Question {currentIndex + 1} of {total}
        </span>
        <span className="text-xs mono text-v2-text-dim">
          {correct}/{answered} correct
        </span>
      </div>
      <TelemetryBar value={progress} segments={total} color="cyan" />

      {/* Question */}
      <HexPanel>
        <p className="text-base text-v2-text leading-relaxed">{q.question}</p>
      </HexPanel>

      {/* Choices */}
      <div className="space-y-2">
        {q.choices.map((choice) => {
          const isSelected = selected === choice.label;
          const isAnswer = choice.label === q.correctAnswer;

          let borderColor = "border-v2-border";
          let bgColor = "bg-v2-bg-surface";
          let textColor = "text-v2-text";
          let labelColor = "text-v2-text-dim";

          if (submitted) {
            if (isAnswer) {
              borderColor = "border-green-500/50";
              bgColor = "bg-green-500/8";
              textColor = "text-green-400";
              labelColor = "text-green-400";
            } else if (isSelected && !isAnswer) {
              borderColor = "border-red-500/50";
              bgColor = "bg-red-500/8";
              textColor = "text-red-400";
              labelColor = "text-red-400";
            } else {
              textColor = "text-v2-text-muted";
              labelColor = "text-v2-text-muted";
            }
          } else if (isSelected) {
            borderColor = "border-v2-cyan/50";
            bgColor = "bg-v2-cyan/5";
            labelColor = "text-v2-cyan";
          }

          return (
            <button
              key={choice.label}
              onClick={() => handleSelect(choice.label)}
              disabled={submitted}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${borderColor} ${bgColor} ${
                !submitted ? "hover:border-v2-cyan/30 cursor-pointer" : "cursor-default"
              }`}
            >
              <span className={`mono text-sm font-bold flex-shrink-0 mt-0.5 ${labelColor}`}>
                {choice.label}
              </span>
              <span className={`text-sm leading-relaxed ${textColor}`}>
                {choice.text}
              </span>
              {submitted && isAnswer && (
                <span className="text-green-400 ml-auto flex-shrink-0">✓</span>
              )}
              {submitted && isSelected && !isAnswer && (
                <span className="text-red-400 ml-auto flex-shrink-0">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (after submit) */}
      {submitted && (
        <div className={`p-3 rounded-lg border ${
          isCorrect
            ? "bg-green-500/5 border-green-500/20"
            : "bg-red-500/5 border-red-500/20"
        }`}>
          <p className={`text-xs font-semibold mb-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
            {isCorrect ? "Correct!" : `Incorrect — the answer is ${q.correctAnswer}`}
          </p>
          <p className="text-xs text-v2-text-dim leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end">
        {!submitted ? (
          <ActionButton
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!selected}
          >
            Submit
          </ActionButton>
        ) : (
          <ActionButton variant="primary" size="md" onClick={handleNext}>
            {answered + 1 >= total ? "See Results" : "Next Question"}
          </ActionButton>
        )}
      </div>
    </div>
  );
}
