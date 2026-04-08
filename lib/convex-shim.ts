"use client";

/**
 * Demo-aware wrappers for Convex React hooks.
 *
 * In demo mode (no NEXT_PUBLIC_CONVEX_URL), useQuery returns an appropriate
 * empty default instead of hanging forever, and useMutation returns a no-op.
 *
 * Every file that imports { useQuery, useMutation } from "convex/react"
 * should import from "@/lib/convex-shim" instead.
 */

import {
  useQuery as realUseQuery,
  useMutation as realUseMutation,
} from "convex/react";
import { DEMO_MODE } from "@/components/convex-provider";

const FN_NAME = Symbol.for("functionName");

const DEMO_PROFILE = {
  _id: "demo" as const,
  _creationTime: 0,
  profileId: "default",
  streak: 7,
  lastSessionDate: new Date().toISOString().split("T")[0],
  totalPoints: 1250,
  badges: ["first-review", "streak-3"],
  totalSessionMinutes: 180,
};

// Queries that return a single object (not an array).
// Everything else defaults to [].
const SINGLE_DEFAULTS: Record<string, unknown> = {
  "forgeProfile:get": DEMO_PROFILE,
  "forgeAgentContext:get": {
    progress: [],
    dueCards: [],
    strugglingCards: [],
    recentReviews: [],
    recentSessions: [],
    profile: DEMO_PROFILE,
    stats: { totalCards: 0, totalReviews: 0, avgQuality: 0 },
  },
  "forgeCards:getByCardId": null,
  "forgeCards:isSeeded": true,
  "forgeConversations:getByThreadId": null,
  "forgeDrills:getBestByScenario": null,
  "forgeSpeedRuns:getBestScore": null,
  "forgeProgress:getByTopic": null,
  "forgeDiagnosisHistory:getBestByScenario": null,
  "forgeQuickDrawHistory:getBestByModule": null,
  "forgeBounties:getBestBountyScore": null,
  "forgeCampaigns:getCampaignState": null,
  "forgeMissions:getMissionState": null,
};

function getDemoDefault(fnRef: unknown): unknown {
  const name = (fnRef as Record<symbol, string>)?.[FN_NAME];
  if (name && name in SINGLE_DEFAULTS) {
    return SINGLE_DEFAULTS[name];
  }
  return [];
}

/**
 * Drop-in replacement for Convex's useQuery.
 * In demo mode, returns type-appropriate empty defaults.
 * Uses 'any' to match Convex's own overloaded signatures.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const useQuery: typeof realUseQuery = ((...args: any[]) => {
  const real = (realUseQuery as any)(...args);
  if (DEMO_MODE) return getDemoDefault(args[0]);
  return real;
}) as any;

/**
 * Drop-in replacement for Convex's useMutation.
 * In demo mode, returns an async no-op.
 */
export const useMutation: typeof realUseMutation = ((...args: any[]) => {
  const real = (realUseMutation as any)(...args);
  if (DEMO_MODE) return (async () => {}) as any;
  return real;
}) as any;
/* eslint-enable @typescript-eslint/no-explicit-any */
