"use client";

import { useMemo } from "react";
import Link from "next/link";

interface Review {
  cardId: string;
  timestamp: string;
  quality: number;
}

interface Session {
  type: string;
  startTime: string;
  cardIds: string[];
}

interface SpeedRun {
  timestamp: string;
  totalCards: number;
  correctCards: number;
  totalPoints: number;
}

interface ActivityTodayProps {
  reviews: Review[];
  sessions: Session[];
  speedRuns: SpeedRun[];
}

export default function ActivityToday({ reviews, sessions, speedRuns }: ActivityTodayProps) {
  const today = new Date().toISOString().split("T")[0];

  const todayReviews = useMemo(
    () => reviews.filter((r) => r.timestamp.startsWith(today)),
    [reviews, today]
  );
  const todaySessions = useMemo(
    () => sessions.filter((s) => s.startTime.startsWith(today)),
    [sessions, today]
  );
  const todaySpeedRuns = useMemo(
    () => speedRuns.filter((r) => r.timestamp.startsWith(today)),
    [speedRuns, today]
  );

  const correct = todayReviews.filter((r) => r.quality >= 4).length;
  const partial = todayReviews.filter((r) => r.quality === 2 || r.quality === 3).length;
  const missed = todayReviews.filter((r) => r.quality <= 1).length;
  const speedRunPoints = todaySpeedRuns.reduce((sum, r) => sum + r.totalPoints, 0);

  const hasActivity =
    todayReviews.length > 0 || todaySessions.length > 0 || todaySpeedRuns.length > 0;

  return (
    <div className="bg-forge-surface border border-forge-border rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs mono text-forge-text-dim uppercase tracking-widest">Actions Today</p>
        <Link
          href="/history"
          className="text-xs text-forge-text-muted hover:text-forge-text-dim mono transition-colors"
        >
          view history →
        </Link>
      </div>

      {!hasActivity ? (
        <p className="text-sm text-forge-text-muted mono">No activity yet — start a session!</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {todayReviews.length > 0 && (
            <div>
              <div>
                <span className="text-2xl font-bold mono">{todayReviews.length}</span>
                <span className="text-xs text-forge-text-dim ml-1.5">cards reviewed</span>
              </div>
              <div className="flex gap-2 mt-0.5 text-[11px] mono">
                {correct > 0 && <span className="text-forge-success">{correct} correct</span>}
                {partial > 0 && <span className="text-forge-warning">{partial} partial</span>}
                {missed > 0 && <span className="text-forge-danger">{missed} missed</span>}
              </div>
            </div>
          )}

          {todaySessions.length > 0 && (
            <div>
              <div>
                <span className="text-2xl font-bold mono">{todaySessions.length}</span>
                <span className="text-xs text-forge-text-dim ml-1.5">
                  session{todaySessions.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] mono text-forge-text-muted">
                {[...new Set(todaySessions.map((s) =>
                  s.type.replace(/-/g, " ")
                ))].join(", ")}
              </div>
            </div>
          )}

          {todaySpeedRuns.length > 0 && (
            <div>
              <div>
                <span className="text-2xl font-bold mono text-forge-accent">
                  {todaySpeedRuns.length}
                </span>
                <span className="text-xs text-forge-text-dim ml-1.5">
                  speed run{todaySpeedRuns.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] mono text-forge-text-muted">
                {speedRunPoints} pts earned
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
