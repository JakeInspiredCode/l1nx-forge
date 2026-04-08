// ═══════════════════════════════════════
// Convex-backed storage hooks
// Replaces localStorage-based lib/storage.ts
// ═══════════════════════════════════════

"use client";

import { useQuery, useMutation } from "@/lib/convex-shim";
import { api } from "../convex/_generated/api";
import { ForgeCard, TopicId, Tier, TopicProgress, ForgeProfile, TOPICS } from "./types";

// ── Cards ──

export function useCards() {
  return useQuery(api.forgeCards.getAll) ?? [];
}

export function useCardsByTopic(topicId: TopicId) {
  return useQuery(api.forgeCards.getByTopic, { topicId }) ?? [];
}

export function useDueCards(topicId?: TopicId) {
  return useQuery(api.forgeCards.getDue, { topicId }) ?? [];
}

export function useNewCards(topicId?: TopicId, maxTier?: Tier) {
  return useQuery(api.forgeCards.getNew, {
    topicId,
    maxTier: maxTier ? Number(maxTier) : undefined,
  }) ?? [];
}

export function useIsSeeded() {
  return useQuery(api.forgeCards.isSeeded) ?? false;
}

export function useSeedCards() {
  return useMutation(api.forgeCards.seedCards);
}

export function useReseedCards() {
  return useMutation(api.forgeCards.reseedCards);
}

export function useUpdateCard() {
  return useMutation(api.forgeCards.updateCard);
}

// ── Reviews ──

export function useReviews(limit?: number) {
  return useQuery(api.forgeReviews.getAll, { limit }) ?? [];
}

export function useRecentReviews(limit?: number) {
  return useQuery(api.forgeReviews.getRecent, { limit }) ?? [];
}

export function useAddReview() {
  return useMutation(api.forgeReviews.add);
}

// ── Sessions ──

export function useSessions(limit?: number) {
  return useQuery(api.forgeSessions.getAll, { limit }) ?? [];
}

export function useRecentSessions(limit?: number) {
  return useQuery(api.forgeSessions.getRecent, { limit }) ?? [];
}

export function useAddSession() {
  return useMutation(api.forgeSessions.add);
}

// ── Progress ──

export function useAllProgress() {
  return useQuery(api.forgeProgress.getAll) ?? [];
}

export function useTopicProgress(topicId: TopicId) {
  return useQuery(api.forgeProgress.getByTopic, { topicId });
}

export function useRecomputeProgress() {
  return useMutation(api.forgeProgressRecompute.recompute);
}

// ── Profile ──

export function useProfile() {
  return useQuery(api.forgeProfile.get) ?? null;
}

export function useUpsertProfile() {
  return useMutation(api.forgeProfile.upsert);
}

export function useAddPoints() {
  return useMutation(api.forgeProfile.addPoints);
}

export function useCheckBadges() {
  return useMutation(api.forgeProfile.checkAndAwardBadges);
}

// ── Stories ──

export function useStories() {
  return useQuery(api.forgeStories.getAll) ?? [];
}

export function useUpsertStory() {
  return useMutation(api.forgeStories.upsert);
}

// ── Speed Runs ──

export function useSpeedRunAdd() {
  return useMutation(api.forgeSpeedRuns.add);
}

export function useSpeedRunHistory(topicId?: string) {
  return useQuery(api.forgeSpeedRuns.getHistory, { topicId, limit: 10 }) ?? [];
}

export function useSpeedRunBestScore(topicId?: string) {
  return useQuery(api.forgeSpeedRuns.getBestScore, { topicId });
}

export function useSpeedRunsRecent(limit?: number) {
  return useQuery(api.forgeSpeedRuns.getRecent, { limit }) ?? [];
}

// ── Drills ──

export function useDrills(limit?: number) {
  return useQuery(api.forgeDrills.getAll, { limit }) ?? [];
}

export function useDrillsByScenario(scenarioId: string) {
  return useQuery(api.forgeDrills.getByScenario, { scenarioId }) ?? [];
}

export function useRecentDrills(limit?: number) {
  return useQuery(api.forgeDrills.getRecent, { limit }) ?? [];
}

export function useDrillBestScore(scenarioId: string) {
  return useQuery(api.forgeDrills.getBestByScenario, { scenarioId });
}
