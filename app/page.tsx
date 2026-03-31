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
import Link from "next/link";

export default function Dashboard() {
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
          tier: c.tier, steps: c.steps, easeFactor: c.easeFactor,
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
  const RESEED_VERSION = 2;
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
          tier: c.tier, steps: c.steps, easeFactor: c.easeFactor,
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

  return (
    <div className="min-h-screen bg-forge-bg">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header stats */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              L1NX Forge
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

        {/* Topic grid */}
        <h2 className="text-lg font-semibold mb-4">Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOPICS.map((topic) => (
            <TopicCard key={topic.id} topic={topic}
              progress={progress.find((p) => p.topicId === topic.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}
