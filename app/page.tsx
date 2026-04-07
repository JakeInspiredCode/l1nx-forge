"use client";

import { useEffect, useState, useMemo } from "react";
import Nav from "@/components/nav";
import TopicCard from "@/components/topic-card";
import ReadinessRadar from "@/components/readiness-radar";
import DailyBriefing from "@/components/daily-briefing";
import DailyPlanDisplay from "@/components/daily-plan";
import CardQueue from "@/components/card-queue";
import { TOPICS, ForgeCard, mapConvexCard } from "@/lib/types";
import {
  useCards, useIsSeeded, useSeedCards, useReseedCards,
  useAllProgress, useProfile, useDueCards,
  useRecomputeProgress, useRecentReviews, useRecentSessions, useSpeedRunsRecent,
} from "@/lib/convex-hooks";
import { getAllSeedCards } from "@/lib/seeds";
import { generateDailyPlan, PlanDifficulty } from "@/lib/forge/scheduler";
import ActivityToday from "@/components/activity-today";
import Onboarding, { isOnboardingDone } from "@/components/onboarding";
import StarMap from "@/components/star-map/star-map";
import Link from "next/link";

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
  const isSeeded = useIsSeeded();
  const seedCards = useSeedCards();
  const reseedCards = useReseedCards();
  const progress = useAllProgress();
  const profile = useProfile();
  const dueCards = useDueCards();
  const recomputeProgress = useRecomputeProgress();
  const recentReviews = useRecentReviews(200);
  const recentSessions = useRecentSessions(30);
  const recentSpeedRuns = useSpeedRunsRecent(20);
  const [seeding, setSeeding] = useState(false);
  const [trainingCards, setTrainingCards] = useState<ForgeCard[] | null>(null);
  const [planTopicFilter, setPlanTopicFilter] = useState<string>("all");
  const [planDifficulty, setPlanDifficulty] = useState<PlanDifficulty>("standard");
  const [planResetKey, setPlanResetKey] = useState(0);

  // Seed on first load if DB is empty
  useEffect(() => {
    if (isSeeded || seeding) return;
    const doSeed = async () => {
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
        await seedCards({ cards: batch });
      }
      for (const t of TOPICS) {
        await recomputeProgress({ topicId: t.id });
      }
      setSeeding(false);
    };
    doSeed();
  }, [isSeeded, seeding, seedCards, recomputeProgress]);

  // Reseed: update existing card text + insert new cards (v2 audit)
  // Bump RESEED_VERSION when seed data changes to trigger a refresh
  const RESEED_VERSION = 4;
  useEffect(() => {
    if (!isSeeded || seeding) return;
    const key = `l1nx-reseed-v${RESEED_VERSION}`;
    if (typeof window !== "undefined" && localStorage.getItem(key)) return;
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
      if (typeof window !== "undefined") localStorage.setItem(key, "done");
      setSeeding(false);
    };
    doReseed();
  }, [isSeeded, seeding, reseedCards, recomputeProgress]);

  const mapCard = mapConvexCard;

  // Generate daily plan from current card data, filtered by topic
  const dailyPlan = useMemo(() => {
    // planResetKey forces regeneration when user clicks Reset Plan
    void planResetKey;
    if (rawCards.length === 0) return null;
    return generateDailyPlan(rawCards, progress, planTopicFilter, planDifficulty);
  }, [rawCards, progress, planTopicFilter, planDifficulty, planResetKey]);

  const dueCount = dueCards.length;
  const totalCards = rawCards.length;

  // Launch training with scheduled card IDs
  const handleStartTraining = (cardIds: string[]) => {
    const cardMap = new Map(rawCards.map((c) => [c.cardId, c]));
    const scheduled = cardIds
      .map((id) => cardMap.get(id))
      .filter(Boolean)
      .map((c) => mapCard(c!));
    if (scheduled.length > 0) {
      setTrainingCards(scheduled);
    }
  };

  if (seeding) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <span className="text-forge-accent mono animate-pulse">Seeding forge database...</span>
      </div>
    );
  }

  // Active training session from daily plan
  if (trainingCards && trainingCards.length > 0) {
    return (
      <div className="min-h-screen bg-forge-bg">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => setTrainingCards(null)}
            className="text-sm text-forge-text-dim hover:text-forge-text mb-6 flex items-center gap-1">
            ← End session
          </button>
          <CardQueue cards={trainingCards} sessionType="daily-training"
            onComplete={() => setTrainingCards(null)} />
        </main>
      </div>
    );
  }

  if (hydrated && showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  // Phase 2: Star Map is the new home screen
  return (
    <div className="min-h-screen bg-forge-bg">
      <Nav />
      <main>
        <StarMap />
      </main>
    </div>
  );
}
