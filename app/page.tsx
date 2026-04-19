"use client";

import { useEffect, useState, useMemo } from "react";
import CardQueue from "@/components/card-queue";
import { TOPICS, ForgeCard, mapConvexCard } from "@/lib/types";
import {
  useCards, useReseedCards,
  useAllProgress, useProfile, useDueCards,
  useRecomputeProgress,
} from "@/lib/convex-hooks";
import { getAllSeedCards } from "@/lib/seeds";
import Onboarding, { isOnboardingDone } from "@/components/onboarding";
import GalaxyMap from "@/components/galaxy-map/galaxy-map";

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (!isOnboardingDone()) {
      setShowOnboarding(true);
    }
  }, []);

  const rawCards = useCards();
  const reseedCards = useReseedCards();
  const progress = useAllProgress();
  const profile = useProfile();
  const recomputeProgress = useRecomputeProgress();
  const [seeding, setSeeding] = useState(false);
  const [trainingCards, setTrainingCards] = useState<ForgeCard[] | null>(null);

  // Card-content reseed: bump RESEED_VERSION when card text/structure changes to
  // push updates out without blowing away per-card review progress.
  const RESEED_VERSION = 4;
  useEffect(() => {
    if (seeding) return;
    const key = `l1nx-reseed-v${RESEED_VERSION}`;
    if (typeof window === "undefined" || localStorage.getItem(key)) return;
    const doReseed = async () => {
      setSeeding(true);
      const allCards = getAllSeedCards();
      for (let i = 0; i < allCards.length; i += 50) {
        const batch = allCards.slice(i, i + 50).map((c) => ({
          cardId: c.id, topicId: c.topicId, type: c.type,
          front: c.front, back: c.back, difficulty: c.difficulty,
          tier: c.tier, steps: c.steps, sortOrder: c.sortOrder,
          easeFactor: c.easeFactor,
          interval: c.interval, repetitions: c.repetitions,
          dueDate: c.dueDate, lastReview: c.lastReview ?? undefined,
        }));
        await reseedCards({ cards: batch });
      }
      for (const t of TOPICS) {
        await recomputeProgress({ topicId: t.id });
      }
      localStorage.setItem(key, "done");
      setSeeding(false);
    };
    doReseed();
  }, [seeding, reseedCards, recomputeProgress]);

  if (seeding) {
    return (
      <div className="h-[calc(100vh-48px)] w-full flex items-center justify-center">
        <span className="telemetry-font text-v2-cyan animate-pulse tracking-wider">
          Initializing ship systems...
        </span>
      </div>
    );
  }

  // Active training session
  if (trainingCards && trainingCards.length > 0) {
    return (
      <div className="h-[calc(100vh-48px)] w-full overflow-hidden">
        <main className="h-full w-full p-6 overflow-auto scroll-container">
          <button
            onClick={() => setTrainingCards(null)}
            className="text-sm text-v2-text-dim hover:text-v2-text mb-6 flex items-center gap-1"
          >
            ← End session
          </button>
          <CardQueue
            cards={trainingCards}
            sessionType="daily-training"
            onComplete={() => setTrainingCards(null)}
          />
        </main>
      </div>
    );
  }

  if (hydrated && showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return <GalaxyMap />;
}
