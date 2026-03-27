"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ForgeCard, Quality } from "@/lib/types";

interface FlashcardProps {
  card: ForgeCard;
  onRate: (quality: Quality, responseTime: number) => void;
  index: number;
  total: number;
}

const RATING_BUTTONS: { label: string; quality: Quality; color: string; key: string }[] = [
  { label: "Again", quality: 1 as Quality, color: "bg-forge-danger/20 text-forge-danger border-forge-danger/30 hover:bg-forge-danger/30", key: "1" },
  { label: "Hard", quality: 3 as Quality, color: "bg-forge-warning/20 text-forge-warning border-forge-warning/30 hover:bg-forge-warning/30", key: "2" },
  { label: "Good", quality: 4 as Quality, color: "bg-forge-accent/20 text-forge-accent border-forge-accent/30 hover:bg-forge-accent/30", key: "3" },
  { label: "Easy", quality: 5 as Quality, color: "bg-forge-success/20 text-forge-success border-forge-success/30 hover:bg-forge-success/30", key: "4" },
];

export default function Flashcard({ card, onRate, index, total }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const timerStart = useRef<number>(Date.now());
  const flipTime = useRef<number>(0);

  useEffect(() => {
    setFlipped(false);
    timerStart.current = Date.now();
    flipTime.current = 0;
  }, [card.id]);

  const handleFlip = useCallback(() => {
    if (!flipped) {
      flipTime.current = Date.now() - timerStart.current;
      setFlipped(true);
    }
  }, [flipped]);

  const handleRate = useCallback((quality: Quality) => {
    onRate(quality, flipTime.current);
  }, [onRate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!flipped) handleFlip();
      }
      if (flipped) {
        const btn = RATING_BUTTONS.find((b) => b.key === e.key);
        if (btn) handleRate(btn.quality);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flipped, handleFlip, handleRate]);

  const tierLabel = ["", "T1 Foundation", "T2 Application", "T3 Scenario", "T4 Branching"][card.tier];
  const tierColor = ["", "text-forge-text-dim", "text-forge-accent", "text-forge-warning", "text-forge-danger"][card.tier];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-forge-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-forge-accent rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-forge-text-dim mono">{index + 1}/{total}</span>
      </div>

      {/* Card */}
      <div className="card-flip" onClick={!flipped ? handleFlip : undefined}>
        <div className={`card-flip-inner ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-front">
            <div className="bg-forge-surface border border-forge-border rounded-xl p-8 min-h-[320px] flex flex-col cursor-pointer hover:border-forge-border-hover transition-colors">
              <div className="flex items-center justify-between mb-6">
                <span className={`text-xs mono ${tierColor}`}>{tierLabel}</span>
                <span className="text-xs text-forge-text-muted mono">{card.topicId}</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="markdown-content text-center text-lg leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.front}</ReactMarkdown>
                </div>
              </div>
              <div className="text-center mt-6">
                <span className="text-xs text-forge-text-muted">Press Space or tap to reveal</span>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="card-back">
            <div className="bg-forge-surface border border-forge-accent/30 rounded-xl p-8 min-h-[320px] flex flex-col forge-glow">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs mono ${tierColor}`}>{tierLabel}</span>
                <span className="text-xs text-forge-accent mono">ANSWER</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="markdown-content text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.back}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons — only visible when flipped */}
      {flipped && (
        <div className="mt-6 flex gap-3 justify-center">
          {RATING_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              onClick={() => handleRate(btn.quality)}
              className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 ${btn.color}`}
            >
              {btn.label}
              <span className="block text-[10px] opacity-60 mono mt-0.5">[{btn.key}]</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
