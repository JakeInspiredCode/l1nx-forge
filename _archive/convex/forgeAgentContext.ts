import { query } from "./_generated/server";

// Returns a snapshot of the user's study state for use in the agent system prompt.
// Fetches progress, weak cards, recent reviews, and recent session transcripts.
export const get = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    // Topic progress
    const progress = await ctx.db.query("forgeProgress").collect();

    // Due cards — use index instead of fetching all cards
    const dueCardsRaw = await ctx.db
      .query("forgeCards")
      .withIndex("by_due", (q) => q.lte("dueDate", today))
      .take(100);
    const dueCards = dueCardsRaw.map((c) => ({
      cardId: c.cardId,
      topicId: c.topicId,
      front: c.front,
      easeFactor: c.easeFactor,
      interval: c.interval,
      repetitions: c.repetitions,
      tier: c.tier,
    }));

    // Struggling cards: still need full scan but only for context, bounded output
    const allCards = await ctx.db.query("forgeCards").collect();
    const strugglingCards = allCards
      .filter((c) => c.easeFactor < 2.0 && c.repetitions > 0)
      .sort((a, b) => a.easeFactor - b.easeFactor)
      .slice(0, 20)
      .map((c) => ({
        cardId: c.cardId,
        topicId: c.topicId,
        front: c.front,
        back: c.back,
        easeFactor: c.easeFactor,
        interval: c.interval,
        tier: c.tier,
      }));

    // Recent reviews (last 100) for performance trend analysis
    const recentReviews = await ctx.db
      .query("forgeReviews")
      .withIndex("by_timestamp")
      .order("desc")
      .take(100);

    // Recent sessions — include mock interview transcripts
    const recentSessions = await ctx.db
      .query("forgeSessions")
      .withIndex("by_startTime")
      .order("desc")
      .take(5);

    // Enrich sessions: resolve card fronts for interview transcripts
    const enrichedSessions = await Promise.all(
      recentSessions.map(async (session) => {
        if (session.type !== "mock-interview" || session.answers.length === 0) {
          return { ...session, enrichedAnswers: [] };
        }
        const enrichedAnswers = await Promise.all(
          session.answers.map(async (answer) => {
            const card = allCards.find((c) => c.cardId === answer.cardId);
            return {
              question: card?.front ?? answer.cardId,
              transcript: answer.transcript,
              rubricScores: answer.rubricScores,
              missedTerms: answer.missedTerms,
            };
          })
        );
        return { ...session, enrichedAnswers };
      })
    );

    // Profile
    const profile = await ctx.db
      .query("forgeProfile")
      .withIndex("by_profileId", (q) => q.eq("profileId", "default"))
      .first();

    // Compute overall stats
    const totalCards = allCards.length;
    const masteredCards = allCards.filter((c) => c.interval >= 21).length;
    const dueCount = dueCards.length;
    const weakTopics = progress.filter((p) => p.weakFlag).map((p) => p.topicId);

    return {
      profile,
      progress,
      weakTopics,
      dueCount,
      totalCards,
      masteredCards,
      dueCards: dueCards.slice(0, 30), // cap to keep context manageable
      strugglingCards,
      recentReviews: recentReviews.map((r) => ({
        cardId: r.cardId,
        quality: r.quality,
        timestamp: r.timestamp,
        responseTime: r.responseTime,
      })),
      recentSessions: enrichedSessions,
    };
  },
});
