"use client";

import HexPanel from "@/components/ui/hex-panel";
import GlowStat from "@/components/ui/glow-stat";
import ActionButton from "@/components/ui/action-button";

interface MissionDebriefProps {
  missionTitle: string;
  passed: boolean;
  score: number;
  total: number;
  xpEarned: number;
  onNextMission?: () => void;
  onReturnToMap: () => void;
  onRetry?: () => void;
}

export default function MissionDebrief({
  missionTitle,
  passed,
  score,
  total,
  xpEarned,
  onNextMission,
  onReturnToMap,
  onRetry,
}: MissionDebriefProps) {
  return (
    <div className="fixed inset-0 bg-v2-bg-deep/95 z-50 flex items-center justify-center p-4">
      <div className="scan-lines absolute inset-0 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md accomplished-flash">
        <HexPanel glow glowColor={passed ? "cyan" : "warning"} size="lg">
          <div className="text-center py-4">
            {/* Header */}
            <h1
              className={`display-font text-2xl tracking-widest mb-1 ${
                passed ? "glow-text-cyan" : "text-v2-warning"
              }`}
            >
              {passed ? "Mission Accomplished" : "Mission Incomplete"}
            </h1>
            <p className="text-sm text-v2-text-dim mb-6">{missionTitle}</p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <GlowStat
                value={`${score}/${total}`}
                label="Score"
                size="md"
              />
              <GlowStat
                value={`${Math.round((score / total) * 100)}%`}
                label="Accuracy"
                size="md"
              />
              {passed && (
                <GlowStat
                  value={`+${xpEarned}`}
                  label="XP"
                  size="md"
                />
              )}
            </div>

            {/* Message */}
            {passed ? (
              <p className="text-sm text-v2-text-dim mb-6">
                Territory claimed. This system is now friendly territory.
              </p>
            ) : (
              <p className="text-sm text-v2-text-dim mb-6">
                Review the material and try again. You keep all activity XP earned.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {passed && onNextMission && (
                <ActionButton variant="primary" size="lg" onClick={onNextMission} className="w-full">
                  Next Mission
                </ActionButton>
              )}
              {onRetry && (
                <ActionButton
                  variant={passed ? "secondary" : "primary"}
                  size={passed ? "md" : "lg"}
                  onClick={onRetry}
                  className="w-full"
                >
                  {passed ? "↻ Practice Again" : "Try Again"}
                </ActionButton>
              )}
              <ActionButton variant="secondary" size="md" onClick={onReturnToMap} className="w-full">
                Return to Map
              </ActionButton>
            </div>
          </div>
        </HexPanel>
      </div>
    </div>
  );
}
