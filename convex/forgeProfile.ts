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
  args: {},
  handler: async (ctx) => {
    const profile = await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();
    if (!profile) return { awarded: [] };

    const existing = new Set(profile.badges);
    const newBadges: string[] = [];

    // first-forge — any session exists
    const sessionCount = (await ctx.db.query("forgeSessions").take(1)).length;
    if (sessionCount > 0 && !existing.has("first-forge")) {
      newBadges.push("first-forge");
    }

    // streak-3, streak-7
    if (profile.streak >= 3 && !existing.has("streak-3")) newBadges.push("streak-3");
    if (profile.streak >= 7 && !existing.has("streak-7")) newBadges.push("streak-7");

    // linux-lord — linux mastery >= 90%
    const progress = await ctx.db.query("forgeProgress").collect();
    const linuxProgress = progress.find((p) => p.topicId === "linux");
    if (linuxProgress && linuxProgress.masteryPercent >= 90 && !existing.has("linux-lord")) {
      newBadges.push("linux-lord");
    }

    // colossus-ready — avg mastery >= 90%
    if (progress.length > 0) {
      const avgMastery = progress.reduce((s, p) => s + p.masteryPercent, 0) / progress.length;
      if (avgMastery >= 90 && !existing.has("colossus-ready")) {
        newBadges.push("colossus-ready");
      }
    }

    // tier-breaker — any topic at Tier 4
    if (progress.some((p) => p.currentTier >= 4) && !existing.has("tier-breaker")) {
      newBadges.push("tier-breaker");
    }

    // mock-master — 5+ mock interviews
    const mockSessions = await ctx.db
      .query("forgeSessions")
      .withIndex("by_type", (q) => q.eq("type", "mock-interview"))
      .collect();
    if (mockSessions.length >= 5 && !existing.has("mock-master")) {
      newBadges.push("mock-master");
    }

    // scenario-slayer — 50+ reviews on scenario-type cards
    const allCards = await ctx.db.query("forgeCards").collect();
    const scenarioIds = new Set(allCards.filter((c) => c.type === "scenario").map((c) => c.cardId));
    const reviews = await ctx.db.query("forgeReviews").collect();
    const scenarioReviews = reviews.filter((r) => scenarioIds.has(r.cardId));
    if (scenarioReviews.length >= 50 && !existing.has("scenario-slayer")) {
      newBadges.push("scenario-slayer");
    }

    // speed-demon — session with 20+ cards completed in under 45 min
    const allSessions = await ctx.db.query("forgeSessions").collect();
    const speedSession = allSessions.find((s) => {
      if (s.cardIds.length < 20 || !s.endTime || !s.startTime) return false;
      const duration = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000;
      return duration < 45;
    });
    if (speedSession && !existing.has("speed-demon")) {
      newBadges.push("speed-demon");
    }

    // Persist
    if (newBadges.length > 0) {
      await ctx.db.patch(profile._id, {
        badges: [...profile.badges, ...newBadges],
      });
    }

    return { awarded: newBadges };
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
