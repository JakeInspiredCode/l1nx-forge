"use client";

import Nav from "@/components/nav";
import { TOPICS, BADGE_DEFS } from "@/lib/types";
import { useAllProgress, useProfile, useSessions, useReviews, useCards } from "@/lib/convex-hooks";

export default function ProgressPage() {
  const progress = useAllProgress();
  const profile = useProfile();
  const sessions = useSessions();
  const reviews = useReviews();
  const cards = useCards();

  const totalReviews = reviews.length;
  const totalCards = cards.length;
  const overallMastery = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + p.masteryPercent, 0) / progress.length)
    : 0;

  return (
    <div className="min-h-screen bg-forge-bg"><Nav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-6 mono">Progress</h1>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Mastery", value: `${overallMastery}%`, color: overallMastery >= 85 ? "text-forge-success" : "text-forge-accent" },
            { label: "Reviews", value: totalReviews.toString(), color: "text-forge-text" },
            { label: "Streak", value: profile?.streak.toString() ?? "0", color: "text-forge-warning" },
            { label: "Points", value: profile?.totalPoints.toString() ?? "0", color: "text-forge-accent" },
            { label: "Sessions", value: sessions.length.toString(), color: "text-forge-text" },
          ].map((stat) => (
            <div key={stat.label} className="bg-forge-surface border border-forge-border rounded-xl p-4 text-center">
              <span className={`text-xl font-bold mono ${stat.color}`}>{stat.value}</span>
              <span className="block text-xs text-forge-text-dim mt-1">{stat.label}</span>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">Badges</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
          {BADGE_DEFS.map((badge) => {
            const earned = profile?.badges.includes(badge.id) ?? false;
            return (
              <div key={badge.id} className={`rounded-xl p-4 text-center border transition-colors ${
                earned ? "bg-forge-accent/10 border-forge-accent/30 forge-glow" : "bg-forge-surface border-forge-border opacity-40"}`}>
                <span className="text-2xl block mb-1">
                  {badge.icon === "anvil" ? "⬡" : badge.icon === "flame-silver" ? "△" :
                   badge.icon === "flame-gold" ? "▲" : badge.icon === "terminal" ? ">" :
                   badge.icon === "crosshair" ? "◎" : badge.icon === "signal" ? "~" :
                   badge.icon === "star" ? "★" : badge.icon === "bolt" ? "⚡" :
                   badge.icon === "chain" ? "⊘" : "●"}
                </span>
                <span className="text-xs font-medium block">{badge.name}</span>
                <span className="text-[10px] text-forge-text-muted block mt-0.5">{badge.condition}</span>
              </div>
            );
          })}
        </div>

        <h2 className="text-lg font-semibold mb-4">Topic Breakdown</h2>
        <div className="space-y-3 mb-8">
          {TOPICS.map((topic) => {
            const tp = progress.find((p) => p.topicId === topic.id);
            const mastery = tp?.masteryPercent ?? 0;
            return (
              <div key={topic.id} className="bg-forge-surface border border-forge-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="mono text-forge-accent">{topic.icon}</span>
                    <span className="text-sm font-medium">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mono">
                    <span className="text-forge-text-muted">T{tp?.currentTier ?? 1}</span>
                    <span className={mastery >= 85 ? "text-forge-success" : mastery >= 50 ? "text-forge-warning" : "text-forge-text-dim"}>{mastery}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-forge-surface-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${mastery >= 85 ? "bg-forge-success" : mastery >= 50 ? "bg-forge-warning" : "bg-forge-accent"}`}
                    style={{ width: `${mastery}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-forge-text-dim text-sm">No sessions yet. Start studying to track progress.</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(-10).reverse().map((s) => (
              <div key={s._id} className="bg-forge-surface border border-forge-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs mono text-forge-accent">{s.type}</span>
                  <span className="text-xs text-forge-text-dim ml-2">
                    {new Date(s.startTime).toLocaleDateString()} — {s.cardIds.length} cards
                  </span>
                </div>
                {s.overallScore != null && (
                  <span className="text-xs mono text-forge-accent">{s.overallScore}%</span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
