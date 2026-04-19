import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();
  },
});

export const upsert = mutation({
  args: {
    streak: v.number(),
    lastSessionDate: v.string(),
    totalPoints: v.number(),
    badges: v.array(v.string()),
    totalSessionMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("forgeProfile", {
      profileId: "default",
      ...args,
    });
  },
});

export const checkAndAwardBadges = mutation({
  args: {
    // Caller hints to avoid redundant full-table scans
    speedRunBestStreak: v.optional(v.number()),
    speedRunCorrect: v.optional(v.number()),
    speedRunTotal: v.optional(v.number()),
    sessionAllGoodOrEasy: v.optional(v.boolean()),
    reviewCount: v.optional(v.number()),
    sessionCount: v.optional(v.number()),
    speedRunCount: v.optional(v.number()),
    drillCount: v.optional(v.number()),
    hasCorrectReview: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();
    if (!profile) return { awarded: [] };

    const has = new Set(profile.badges);
    const earn: string[] = [];
    const maybe = (id: string) => { if (!has.has(id)) earn.push(id); };

    // ── Use caller hints when available, otherwise fetch bounded counts ──
    // For reviews: only fetch enough to check the highest milestone (500)
    const reviewCount = args.reviewCount ??
      (await ctx.db.query("forgeReviews").withIndex("by_timestamp").take(501)).length;
    const sessionCount = args.sessionCount ??
      (await ctx.db.query("forgeSessions").withIndex("by_startTime").take(26)).length;
    const speedRunCount = args.speedRunCount ??
      (await ctx.db.query("forgeSpeedRuns").withIndex("by_timestamp").take(11)).length;

    // Progress is always small (8-10 topics), safe to collect
    const progress = await ctx.db.query("forgeProgress").collect();

    // ── First-time / instant badges ──
    if (sessionCount > 0) maybe("first-forge");
    if (reviewCount > 0) maybe("first-flip");
    if (reviewCount > 0) maybe("first-topic");
    if (speedRunCount > 0) maybe("first-speed");

    // Only check for quality >= 5 review if not already earned and no hint
    if (!has.has("first-correct")) {
      const hasCorrect = args.hasCorrectReview ??
        !!(await ctx.db.query("forgeReviews").withIndex("by_timestamp").order("desc").take(200))
          .find((r) => r.quality >= 5);
      if (hasCorrect) maybe("first-correct");
    }

    // curious-mind — any conversation thread exists
    if (!has.has("curious-mind")) {
      const convos = await ctx.db.query("forgeConversations").take(1);
      if (convos.length > 0) maybe("curious-mind");
    }

    // ── Volume milestones ──
    if (reviewCount >= 10) maybe("cards-10");
    if (reviewCount >= 25) maybe("cards-25");
    if (reviewCount >= 50) maybe("cards-50");
    if (reviewCount >= 100) maybe("cards-100");
    if (reviewCount >= 250) maybe("cards-250");
    if (reviewCount >= 500) maybe("cards-500");

    // ── Points milestones ──
    if (profile.totalPoints >= 100) maybe("points-100");
    if (profile.totalPoints >= 500) maybe("points-500");
    if (profile.totalPoints >= 1000) maybe("points-1000");
    if (profile.totalPoints >= 5000) maybe("points-5000");

    // ── Streak badges ──
    if (profile.streak >= 2) maybe("streak-2");
    if (profile.streak >= 3) maybe("streak-3");
    if (profile.streak >= 5) maybe("streak-5");
    if (profile.streak >= 7) maybe("streak-7");
    if (profile.streak >= 14) maybe("streak-14");
    if (profile.streak >= 30) maybe("streak-30");

    // ── Session count badges ──
    if (sessionCount >= 3) maybe("sessions-3");
    if (sessionCount >= 10) maybe("sessions-10");
    if (sessionCount >= 25) maybe("sessions-25");

    // ── Speed run badges ──
    if (speedRunCount >= 3) maybe("speed-run-3");
    if (speedRunCount >= 10) maybe("speed-run-10");

    // Best streak — use caller hint or scan only speed runs (bounded above)
    if (!has.has("speed-10-streak")) {
      const speedRuns = await ctx.db.query("forgeSpeedRuns").withIndex("by_timestamp").order("desc").take(50);
      const bestStreakDB = speedRuns.reduce((m, r) => Math.max(m, r.bestStreak ?? 0), 0);
      const bestStreak = Math.max(bestStreakDB, args.speedRunBestStreak ?? 0);
      if (bestStreak >= 3) maybe("speed-3-streak");
      if (bestStreak >= 5) maybe("speed-5-streak");
      if (bestStreak >= 10) maybe("speed-10-streak");

      // Perfect speed run
      const hasPerfect = speedRuns.some((r) => r.totalCards >= 5 && r.correctCards === r.totalCards)
        || (args.speedRunCorrect != null && args.speedRunTotal != null
            && args.speedRunTotal >= 5 && args.speedRunCorrect === args.speedRunTotal);
      if (hasPerfect) maybe("speed-perfect-5");
    }

    // ── Topic mastery badges ──
    const masteryOf = (topicId: string) => progress.find((p) => p.topicId === topicId)?.masteryPercent ?? 0;

    if (masteryOf("linux") >= 25) maybe("linux-beginner");
    if (masteryOf("linux") >= 90) maybe("linux-lord");
    if (masteryOf("networking") >= 25) maybe("network-beginner");
    if (masteryOf("networking") >= 90) maybe("network-pro");
    if (masteryOf("hardware") >= 25) maybe("hardware-beginner");
    if (masteryOf("hardware") >= 90) maybe("hardware-pro");

    if (progress.some((p) => p.masteryPercent >= 50)) maybe("any-topic-50");
    if (progress.length >= 8 && progress.every((p) => p.masteryPercent >= 25)) maybe("all-topics-25");
    if (progress.length >= 8 && progress.every((p) => p.masteryPercent >= 50)) maybe("all-topics-50");

    // Scale-ready — avg mastery >= 90%
    if (progress.length > 0) {
      const avg = progress.reduce((s, p) => s + p.masteryPercent, 0) / progress.length;
      if (avg >= 90) maybe("colossus-ready");
    }

    // ── Tier badges ──
    if (progress.some((p) => p.currentTier >= 2)) maybe("tier-2-any");
    if (progress.some((p) => p.currentTier >= 3)) maybe("tier-3-any");
    if (progress.some((p) => p.currentTier >= 4)) maybe("tier-breaker");

    // ── Mock master — only check if not already earned ──
    if (!has.has("mock-master")) {
      const mockSessions = await ctx.db.query("forgeSessions")
        .withIndex("by_type", (q) => q.eq("type", "mock-interview"))
        .take(6);
      if (mockSessions.length >= 5) maybe("mock-master");
    }

    // ── Scenario slayer — only check if not already earned ──
    if (!has.has("scenario-slayer")) {
      // Get scenario card IDs using the topic index (much smaller than all cards)
      const scenarioCards = await ctx.db.query("forgeCards").collect();
      const scenarioIds = new Set(scenarioCards.filter((c) => c.type === "scenario").map((c) => c.cardId));
      // Count scenario reviews from recent reviews only (bounded)
      const recentReviews = await ctx.db.query("forgeReviews").withIndex("by_timestamp").order("desc").take(500);
      const scenarioReviewCount = recentReviews.filter((r) => scenarioIds.has(r.cardId)).length;
      if (scenarioReviewCount >= 50) maybe("scenario-slayer");
    }

    // ── Speed demon — only check if not already earned ──
    if (!has.has("speed-demon")) {
      const recentSessions = await ctx.db.query("forgeSessions")
        .withIndex("by_startTime").order("desc").take(50);
      const speedSession = recentSessions.find((s) => {
        if (s.cardIds.length < 20 || !s.endTime || !s.startTime) return false;
        const dur = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000;
        return dur < 45;
      });
      if (speedSession) maybe("speed-demon");
    }

    // ── Flawless session ──
    if (args.sessionAllGoodOrEasy) maybe("perfect-session");

    // ── Incident Drill badges ──
    const drillCount = args.drillCount ??
      (await ctx.db.query("forgeDrills").withIndex("by_timestamp").take(11)).length;
    if (drillCount > 0) maybe("first-drill");
    if (drillCount >= 3) maybe("drill-3");
    if (drillCount >= 10) maybe("drill-10");

    if (!has.has("drill-perfect") || !has.has("drill-80") || !has.has("drill-all-scenarios")) {
      const drills = await ctx.db.query("forgeDrills").withIndex("by_timestamp").order("desc").take(100);
      if (drills.some((d) => d.overallTermHitRate === 100)) maybe("drill-perfect");
      if (drills.some((d) => d.overallTermHitRate >= 80)) maybe("drill-80");
      const uniqueScenarios = new Set(drills.map((d) => d.scenarioId));
      if (uniqueScenarios.size >= 5) maybe("drill-all-scenarios");
    }

    // ── Persist ──
    if (earn.length > 0) {
      await ctx.db.patch(profile._id, {
        badges: [...profile.badges, ...earn],
      });
    }

    return { awarded: earn };
  },
});

export const recordSessionComplete = mutation({
  args: { sessionMinutes: v.number() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const profile = await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();

    if (!profile) {
      // First ever session — create profile with streak 1
      return await ctx.db.insert("forgeProfile", {
        profileId: "default",
        streak: 1,
        lastSessionDate: today,
        totalPoints: 0,
        badges: [],
        totalSessionMinutes: args.sessionMinutes,
      });
    }

    // Already recorded a session today — just add minutes
    if (profile.lastSessionDate === today) {
      await ctx.db.patch(profile._id, {
        totalSessionMinutes: profile.totalSessionMinutes + args.sessionMinutes,
      });
      return profile._id;
    }

    // Check if yesterday — continue streak
    const lastDate = new Date(profile.lastSessionDate + "T00:00:00");
    const todayDate = new Date(today + "T00:00:00");
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);

    const newStreak = diffDays === 1 ? profile.streak + 1 : 1;

    await ctx.db.patch(profile._id, {
      streak: newStreak,
      lastSessionDate: today,
      totalSessionMinutes: profile.totalSessionMinutes + args.sessionMinutes,
    });
    return profile._id;
  },
});

export const addPoints = mutation({
  args: { points: v.number() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();
    if (!profile) {
      return await ctx.db.insert("forgeProfile", {
        profileId: "default",
        streak: 0,
        lastSessionDate: "",
        totalPoints: args.points,
        badges: [],
        totalSessionMinutes: 0,
      });
    }
    const multiplier = profile.streak >= 3 ? 2 : 1;
    await ctx.db.patch(profile._id, {
      totalPoints: profile.totalPoints + args.points * multiplier,
    });
    return profile._id;
  },
});
