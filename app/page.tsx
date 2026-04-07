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

  return (
    <div className="min-h-screen bg-forge-bg">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header stats */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              L1NX
            </h1>
            <p className="text-forge-text-dim text-sm">
              {totalCards} cards loaded — {dueCount} due today
            </p>
          </div>
          <div className="flex items-center gap-6">
            {profile && (
              <>
                <div className="text-right">
                  <span className="text-xl font-bold mono text-forge-warning">{profile.streak}</span>
                  <span className="block text-xs text-forge-text-dim">day streak</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold mono text-forge-accent">{profile.totalPoints}</span>
                  <span className="block text-xs text-forge-text-dim">points</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold mono text-forge-success">{profile.badges.length}</span>
                  <span className="block text-xs text-forge-text-dim">badges</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions today */}
        <ActivityToday
          reviews={recentReviews}
          sessions={recentSessions}
          speedRuns={recentSpeedRuns}
        />

        {/* Daily briefing */}
        <DailyBriefing progress={progress} dueCount={dueCount} totalCards={totalCards} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Radar chart */}
          <div className="lg:col-span-1">
            <ReadinessRadar progress={progress} />
          </div>

          {/* Daily plan + quick actions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Daily training plan */}
            <DailyPlanDisplay
              plan={dailyPlan}
              onStartTraining={handleStartTraining}
              topicFilter={planTopicFilter}
              onTopicFilterChange={setPlanTopicFilter}
              difficulty={planDifficulty}
              onDifficultyChange={setPlanDifficulty}
              onResetPlan={() => {
                localStorage.removeItem("l1nx-plan-done");
                setPlanResetKey((k) => k + 1);
              }}
            />

            {/* Mock interview CTA */}
            <Link href="/interview" className="block">
              <div className="bg-forge-surface border border-forge-border rounded-xl p-5 hover:border-forge-border-hover transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-0.5">Mock Interview</h3>
                    <p className="text-sm text-forge-text-dim">Timed practice with AI scoring</p>
                  </div>
                  <span className="text-xl text-forge-text-muted">◎</span>
                </div>
              </div>
            </Link>

            {profile && profile.totalSessionMinutes > 0 && (
              <div className="bg-forge-surface-2 rounded-xl p-4 text-center">
                <span className="text-sm text-forge-text-dim">Estimated MTTR improvement: </span>
                <span className="mono text-forge-success font-bold">
                  {Math.round(profile.totalSessionMinutes * 0.5)}s faster
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Linux — primary focus */}
        {(() => {
          const linuxTopic = TOPICS.find((t) => t.id === "linux")!;
          const linuxProgress = progress.find((p) => p.topicId === "linux");
          const tierLabel = linuxProgress ? `Tier ${linuxProgress.currentTier}` : "Tier 1";
          const tierKey = `tier${linuxProgress?.currentTier ?? 1}` as keyof NonNullable<typeof linuxProgress>["tierProgress"];
          const tierData = linuxProgress?.tierProgress?.[tierKey];
          const qualified = tierData?.qualified ?? 0;
          const total = tierData?.total ?? 0;
          const pct = total > 0 ? Math.round((qualified / total) * 100) : 0;

          return (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Linux</h2>
              <div className="bg-forge-surface border border-forge-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-forge-accent mono font-bold text-sm">{linuxTopic.icon}</span>
                      <span className="font-medium text-forge-text">{linuxTopic.name}</span>
                    </div>
                    <p className="text-forge-text-dim text-sm">{linuxTopic.description}</p>
                  </div>
                  <span className="mono text-forge-accent text-sm font-medium">{tierLabel}</span>
                </div>
                {/* Tier progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-forge-text-dim mb-1">
                    <span>{tierLabel} progress</span>
                    <span>{qualified}/{total} cards mastered ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-forge-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-forge-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href="/study?topic=linux"
                    className="px-4 py-2 bg-forge-accent/15 text-forge-accent rounded-md text-sm font-medium hover:bg-forge-accent/25 transition-colors">
                    Continue studying
                  </Link>
                  <Link href="/explore"
                    className="px-4 py-2 bg-forge-surface-2 text-forge-text-dim rounded-md text-sm hover:text-forge-text hover:bg-forge-border transition-colors">
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* DC Fundamentals — compact row */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">DC Fundamentals — Tier 1</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {TOPICS.filter((t) => t.id !== "linux").map((topic) => {
              const tp = progress.find((p) => p.topicId === topic.id);
              const t1 = tp?.tierProgress?.tier1;
              const pct = t1 && t1.total > 0 ? Math.round((t1.qualified / t1.total) * 100) : 0;
              return (
                <Link key={topic.id} href={`/study?topic=${topic.id}`}
                  className="bg-forge-surface border border-forge-border rounded-lg p-3 hover:border-forge-border-hover transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-forge-accent mono text-xs">{topic.icon}</span>
                    <span className="text-sm font-medium text-forge-text truncate">{topic.name}</span>
                  </div>
                  <div className="h-1.5 bg-forge-surface-2 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-forge-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-forge-text-dim">{pct}%</span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
