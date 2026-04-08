"use client";

import type { Sector, SectorProgress } from "@/lib/types/campaign";
import { getCampaign } from "@/lib/seeds/campaigns";

interface SectorTooltipProps {
  sector: Sector;
  progress: SectorProgress;
  mousePos: { x: number; y: number };
}

export default function SectorTooltip({ sector, progress, mousePos }: SectorTooltipProps) {
  const campaign = getCampaign(sector.campaignIds[0]);
  const pct = progress.totalMissions > 0
    ? Math.round((progress.completedMissions / progress.totalMissions) * 100)
    : 0;

  return (
    <div
      className="fixed z-[70] pointer-events-none"
      style={{
        left: mousePos.x + 16,
        top: mousePos.y - 8,
      }}
    >
      <div
        className="hex-panel px-4 py-3 min-w-[180px] max-w-[240px]"
        style={{
          borderColor: `${sector.color}40`,
          boxShadow: `0 0 16px ${sector.color}15`,
        }}
      >
        {/* Title */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm">{sector.icon}</span>
          <span
            className="display-font text-xs tracking-wider uppercase"
            style={{ color: sector.color }}
          >
            {sector.title}
          </span>
        </div>

        {/* Description */}
        <p className="text-[10px] text-v2-text-dim leading-tight mb-2 line-clamp-2">
          {sector.description}
        </p>

        {/* Campaign name */}
        {campaign && (
          <div className="text-[9px] telemetry-font text-v2-text-muted mb-2 uppercase tracking-wider">
            {campaign.title}
          </div>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-v2-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                backgroundColor: progress.isComplete ? "#22c55e" : sector.color,
              }}
            />
          </div>
          <span className="text-[9px] telemetry-font text-v2-text-muted">
            {progress.completedMissions}/{progress.totalMissions}
          </span>
        </div>

        {/* Status */}
        <div className="mt-1.5 text-[9px] telemetry-font uppercase tracking-wider">
          {progress.isComplete ? (
            <span className="text-green-400">Secured</span>
          ) : progress.hasVolunteered ? (
            <span style={{ color: sector.color }}>Active</span>
          ) : (
            <span className="text-v2-text-muted">Unexplored</span>
          )}
        </div>
      </div>
    </div>
  );
}
