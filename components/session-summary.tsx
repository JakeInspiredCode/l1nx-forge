"use client";

import { ForgeCard, Quality } from "@/lib/types";
import { useProfile } from "@/lib/convex-hooks";

interface ReviewResult {
  cardId: string;
  quality: Quality;
  responseTime: number;
  topicId: string;
}

interface SessionSummaryProps {
  results: ReviewResult[];
  cards: ForgeCard[];
  duration: number;
  onClose?: () => void;
}

export default function SessionSummary({ results, cards, duration, onClose }: SessionSummaryProps) {
  const profile = useProfile();
  const correct = results.filter((r) => r.quality >= 3).length;
  const accuracy = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const weakCards = results
    .filter((r) => r.quality < 3)
    .map((r) => cards.find((c) => c.id === r.cardId))
    .filter(Boolean);

  const topicBreakdown: Record<string, { total: number; correct: number }> = {};
  results.forEach((r) => {
    if (!topicBreakdown[r.topicId]) topicBreakdown[r.topicId] = { total: 0, correct: 0 };
    topicBreakdown[r.topicId].total++;
    if (r.quality >= 3) topicBreakdown[r.topicId].correct++;
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-forge-surface border border-forge-border rounded-xl p-8">
        <div className="text-center mb-8">
          <span className="text-3xl mb-2 block">
            {accuracy >= 90 ? "◆" : accuracy >= 70 ? "▲" : "●"}
          </span>
          <h2 className="text-xl font-bold mb-1">Session Complete</h2>
          <p className="text-forge-text-dim text-sm">
            {minutes}m {seconds}s — {results.length} cards reviewed
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-forge-surface-2 rounded-lg p-4 text-center">
            <span className={`text-2xl font-bold mono ${
              accuracy >= 85 ? "text-forge-success" : accuracy >= 60 ? "text-forge-warning" : "text-forge-danger"
            }`}>{accuracy}%</span>
            <span className="block text-xs text-forge-text-dim mt-1">Accuracy</span>
          </div>
          <div className="bg-forge-surface-2 rounded-lg p-4 text-center">
            <span className="text-2xl font-bold mono text-forge-accent">{profile?.totalPoints ?? 0}</span>
            <span className="block text-xs text-forge-text-dim mt-1">Total Points</span>
          </div>
          <div className="bg-forge-surface-2 rounded-lg p-4 text-center">
            <span className="text-2xl font-bold mono text-forge-warning">{profile?.streak ?? 0}</span>
            <span className="block text-xs text-forge-text-dim mt-1">Day Streak</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-forge-text-dim">By Topic</h3>
          <div className="space-y-2">
            {Object.entries(topicBreakdown).map(([topicId, data]) => (
              <div key={topicId} className="flex items-center justify-between text-sm">
                <span className="mono text-forge-text-dim">{topicId}</span>
                <span className={`mono ${
                  data.correct / data.total >= 0.85 ? "text-forge-success" :
                  data.correct / data.total >= 0.6 ? "text-forge-warning" : "text-forge-danger"
                }`}>
                  {data.correct}/{data.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {weakCards.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-forge-danger">Needs Review ({weakCards.length})</h3>
            <div className="space-y-2">
              {weakCards.slice(0, 5).map((card) => card && (
                <div key={card.id} className="bg-forge-danger/5 border border-forge-danger/20 rounded-lg p-3 text-sm">
                  {card.front.substring(0, 120)}{card.front.length > 120 ? "..." : ""}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-forge-accent/20 text-forge-accent border border-forge-accent/30 rounded-lg font-medium hover:bg-forge-accent/30 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
