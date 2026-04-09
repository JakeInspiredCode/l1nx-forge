/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as forgeAgentContext from "../forgeAgentContext.js";
import type * as forgeBounties from "../forgeBounties.js";
import type * as forgeCampaigns from "../forgeCampaigns.js";
import type * as forgeCards from "../forgeCards.js";
import type * as forgeConversations from "../forgeConversations.js";
import type * as forgeDiagnosisHistory from "../forgeDiagnosisHistory.js";
import type * as forgeDrills from "../forgeDrills.js";
import type * as forgeMissions from "../forgeMissions.js";
import type * as forgeProfile from "../forgeProfile.js";
import type * as forgeProgress from "../forgeProgress.js";
import type * as forgeProgressRecompute from "../forgeProgressRecompute.js";
import type * as forgeQuickDrawHistory from "../forgeQuickDrawHistory.js";
import type * as forgeReviews from "../forgeReviews.js";
import type * as forgeSessions from "../forgeSessions.js";
import type * as forgeSpeedRuns from "../forgeSpeedRuns.js";
import type * as forgeStories from "../forgeStories.js";
import type * as forgeTicketHistory from "../forgeTicketHistory.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  forgeAgentContext: typeof forgeAgentContext;
  forgeBounties: typeof forgeBounties;
  forgeCampaigns: typeof forgeCampaigns;
  forgeCards: typeof forgeCards;
  forgeConversations: typeof forgeConversations;
  forgeDiagnosisHistory: typeof forgeDiagnosisHistory;
  forgeDrills: typeof forgeDrills;
  forgeMissions: typeof forgeMissions;
  forgeProfile: typeof forgeProfile;
  forgeProgress: typeof forgeProgress;
  forgeProgressRecompute: typeof forgeProgressRecompute;
  forgeQuickDrawHistory: typeof forgeQuickDrawHistory;
  forgeReviews: typeof forgeReviews;
  forgeSessions: typeof forgeSessions;
  forgeSpeedRuns: typeof forgeSpeedRuns;
  forgeStories: typeof forgeStories;
  forgeTicketHistory: typeof forgeTicketHistory;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
