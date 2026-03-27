"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ForgeCard, Quality } from "@/lib/types";
import { sm2 } from "@/lib/sm2";
import Flashcard from "./flashcard";
import StepReveal from "./step-reveal";
import SessionSummary from "./session-summary";
import TierUnlockToast from "./tier-unlock-toast";

interface CardQueueProps {
  cards: ForgeCard[];
  sessionType: "daily-training" | "topic-drill" | "mock-interview";
  onComplete?: () => void;
}

interface ReviewResult {
  cardId: string;
  quality: Quality;
  responseTime: number;
  topicId: string;
}

export default function CardQueue({ cards, sessionType, onComplete }: CardQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [sessionStart] = useState(Date.now());
  const [tierUnlock, setTierUnlock] = useState<{ topicId: string; newTier: number } | null>(null);

  const updateCard = useMutation(api.forgeCards.updateCard);
  const addReview = useMutation(api.forgeReviews.add);
  const addPoints = useMutation(api.forgeProfile.addPoints);
  const recomputeProgress = useMutation(api.forgeProgressRecompute.recompute);
  const addSession = useMutation(api.forgeSessions.add);
  const upsertProfile = useMutation(api.forgeProfile.upsert);

  const handleRate = useCallback(async (quality: Quality, responseTime: number) => {
    const card = cards[currentIndex];
    if (!card) return;

    // Run SM-2 (pure function — no DB dependency)
    const result = sm2(card, quality, responseTime);
    const today = new Date().toISOString().split("T")[0];

    // Optimistic: advance to next card immediately
    const newResult: ReviewResult = {
      cardId: card.id, quality, responseTime, topicId: card.topicId,
    };
    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    const isLast = currentIndex + 1 >= cards.length;
    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
    }

    // Fire mutations async (optimistic UI — card already advanced)
    try {
      await updateCard({
        cardId: card.id,
        ...result,
        lastReview: today,
      });
      await addReview({
        cardId: card.id,
        timestamp: new Date().toISOString(),
        quality,
        responseTime,
      });

      const pts = card.type === "scenario" ? 25 : card.tier === 4 ? 40 : 10;
      await addPoints({ points: pts });
      const progressResult = await recomputeProgress({ topicId: card.topicId });
      if (progressResult && progressResult.currentTier > progressResult.previousTier) {
        setTierUnlock({ topicId: card.topicId, newTier: progressResult.currentTier });
      }
    } catch (err) {
      console.error("Review mutation error:", err);
    }

    if (isLast) {
      // Session complete — update profile
      const sessionMinutes = Math.round((Date.now() - sessionStart) / 60000);
      try {
        await addSession({
          type: sessionType,
          startTime: new Date(sessionStart).toISOString(),
          endTime: new Date().toISOString(),
          cardIds: cards.map((c) => c.id),
          answers: [],
          overallScore: undefined,
        });
      } catch (err) {
        console.error("Session save error:", err);
      }
      setFinished(true);
    }
  }, [cards, currentIndex, results, sessionStart, sessionType,
      updateCard, addReview, addPoints, recomputeProgress, addSession]);

  if (finished) {
    return (
      <SessionSummary
        results={results}
        cards={cards}
        duration={Math.round((Date.now() - sessionStart) / 1000)}
        onClose={onComplete}
      />
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl mb-4 block">◇</span>
        <h2 className="text-xl font-semibold mb-2">No cards due</h2>
        <p className="text-forge-text-dim">All caught up. Come back later or study new cards.</p>
      </div>
    );
  }

  const card = cards[currentIndex];

  // Tier 4 branching cards use step-reveal
  if (card.tier === 4 && card.steps && card.steps.length > 0) {
    return (
      <>
        {tierUnlock && (
          <TierUnlockToast topicId={tierUnlock.topicId} newTier={tierUnlock.newTier}
            onDismiss={() => setTierUnlock(null)} />
        )}
        <StepReveal card={card} onRate={handleRate} index={currentIndex} total={cards.length} />
      </>
    );
  }

  return (
    <>
      {tierUnlock && (
        <TierUnlockToast topicId={tierUnlock.topicId} newTier={tierUnlock.newTier}
          onDismiss={() => setTierUnlock(null)} />
      )}
      <Flashcard card={card} onRate={handleRate} index={currentIndex} total={cards.length} />
    </>
  );
}
