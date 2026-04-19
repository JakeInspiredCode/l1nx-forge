import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Full server-side progress recomputation for a topic.
// Called after each card review to update mastery, tier status, and card counts.
export const recompute = mutation({
  args: { topicId: v.string() },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("forgeCards")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();

    const today = new Date().toISOString().split("T")[0];

    const tiers: Record<string, { total: number; qualified: number }> = {
      tier1: { total: 0, qualified: 0 },
      tier2: { total: 0, qualified: 0 },
      tier3: { total: 0, qualified: 0 },
      tier4: { total: 0, qualified: 0 },
    };

    let mastered = 0, learning = 0, newCount = 0;
    for (const card of cards) {
      const tierKey = `tier${card.tier}`;
      if (tiers[tierKey]) tiers[tierKey].total++;

      if (card.repetitions === 0) {
        newCount++;
      } else if (card.interval >= 21) {
        mastered++;
        if (tiers[tierKey]) tiers[tierKey].qualified++;
      } else {
        learning++;
        // Qualified if quality >= 3 on last review — query per-card using index
        const lastReview = await ctx.db
          .query("forgeReviews")
          .withIndex("by_card_timestamp", (q) => q.eq("cardId", card.cardId))
          .order("desc")
          .first();
        if (lastReview && lastReview.quality >= 3) {
          if (tiers[tierKey]) tiers[tierKey].qualified++;
        }
      }
    }

    // Tier unlock logic
    let currentTier = 1;
    const t1 = tiers.tier1;
    if (t1.total > 0 && t1.qualified / t1.total >= 0.7) currentTier = 2;
    const t2 = tiers.tier2;
    if (currentTier >= 2 && t2.total > 0 && t2.qualified / t2.total >= 0.7) currentTier = 3;
    const t3 = tiers.tier3;
    if (currentTier >= 3 && t3.total > 0) {
      const t3Cards = cards.filter((c) => c.tier === 3 && c.interval >= 3);
      if (t3Cards.length / t3.total >= 0.8) currentTier = 4;
    }

    const masteryPercent = cards.length > 0
      ? Math.round(((mastered + learning * 0.5) / cards.length) * 100)
      : 0;

    const progress = {
      topicId: args.topicId,
      masteryPercent,
      currentTier,
      tierProgress: tiers as {
        tier1: { total: number; qualified: number };
        tier2: { total: number; qualified: number };
        tier3: { total: number; qualified: number };
        tier4: { total: number; qualified: number };
      },
      totalCards: cards.length,
      masteredCards: mastered,
      learningCards: learning,
      newCards: newCount,
      weakFlag: masteryPercent < 85,
      lastUpdated: today,
    };

    // Upsert into forgeProgress
    const existing = await ctx.db
      .query("forgeProgress")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, progress);
      return { ...progress, _id: existing._id, previousTier: existing.currentTier };
    }
    const id = await ctx.db.insert("forgeProgress", progress);
    return { ...progress, _id: id, previousTier: 0 };
  },
});
