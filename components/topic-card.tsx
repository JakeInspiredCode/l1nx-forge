"use client";

import Link from "next/link";
import { TopicMeta } from "@/lib/types";

interface ProgressLike {
  topicId: string;
  masteryPercent: number;
  currentTier: number;
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  newCards: number;
  weakFlag: boolean;
  [key: string]: unknown;
}

interface TopicCardProps {
  topic: TopicMeta;
  progress?: ProgressLike;
}

export default function TopicCard({ topic, progress }: TopicCardProps) {
  const mastery = progress?.masteryPercent ?? 0;
  const tier = progress?.currentTier ?? 1;
  const total = progress?.totalCards ?? 0;
  const mastered = progress?.masteredCards ?? 0;
  const learning = progress?.learningCards ?? 0;
  const newCount = progress?.newCards ?? total;

  const borderColor =
    mastery >= 85 ? "border-forge-success/50" :
    mastery >= 50 ? "border-forge-warning/50" :
    "border-forge-border";

  const glowClass =
    mastery >= 85 ? "forge-glow-success" :
    mastery < 50 && total > 0 ? "forge-glow-danger" : "";

  const tierLabel = `Tier ${tier}`;

  return (
    <Link href={`/study/${topic.id}`} className="block">
      <div className={`bg-forge-surface border ${borderColor} rounded-xl p-5 hover:border-forge-border-hover transition-all duration-150 ${glowClass}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="mono text-forge-accent text-lg">{topic.icon}</span>
            <div>
              <h3 className="font-semibold text-sm">{topic.name}</h3>
              <p className="text-xs text-forge-text-dim">{topic.description}</p>
            </div>
          </div>
          <span className="text-xs mono text-forge-text-muted bg-forge-surface-2 px-2 py-0.5 rounded">
            {tierLabel}
          </span>
        </div>

        {/* Mastery bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-forge-text-dim">Mastery</span>
            <span className={`mono font-medium ${
              mastery >= 85 ? "text-forge-success" :
              mastery >= 50 ? "text-forge-warning" :
              "text-forge-text-dim"
            }`}>{mastery}%</span>
          </div>
          <div className="h-1.5 bg-forge-surface-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                mastery >= 85 ? "bg-forge-success" :
                mastery >= 50 ? "bg-forge-warning" :
                "bg-forge-accent"
              }`}
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>

        {/* Card counts */}
        <div className="flex gap-4 text-xs">
          <span className="text-forge-text-dim">
            <span className="text-forge-success mono">{mastered}</span> mastered
          </span>
          <span className="text-forge-text-dim">
            <span className="text-forge-warning mono">{learning}</span> learning
          </span>
          <span className="text-forge-text-dim">
            <span className="text-forge-text-muted mono">{newCount}</span> new
          </span>
        </div>
      </div>
    </Link>
  );
}
