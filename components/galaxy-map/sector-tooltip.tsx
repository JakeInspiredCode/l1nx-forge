"use client";

import type { Sector, SectorProgress } from "@/lib/types/campaign";
import { getCampaign } from "@/lib/seeds/campaigns";

interface SectorTooltipProps {
  sector: Sector;
  progress: SectorProgress;
  mousePos: { x: number; y: number };
}

const SECTOR_GREEK: Record<string, string> = {
  "sector-linux": "Alpha",
  "sector-hardware": "Beta",
  "sector-networking": "Gamma",
  "sector-fiber": "Delta",
  "sector-power": "Epsilon",
  "sector-ops": "Zeta",
  "sector-scale": "Eta",
};

export default function SectorTooltip({ sector, progress, mousePos }: SectorTooltipProps) {
  const campaign = getCampaign(sector.campaignIds[0]);
  const pct = progress.totalMissions > 0
    ? Math.round((progress.completedMissions / progress.totalMissions) * 100)
    : 0;
  const greekName = SECTOR_GREEK[sector.id] ?? "";

  return (
    <div
      className="fixed z-[70] pointer-events-none"
      style={{
        left: mousePos.x + 16,
        top: mousePos.y - 8,
      }}
    >
      <div
        className="hex-panel px-4 py-3 min-w-[200px] max-w-[260px]"
        style={{
          borderColor: `${sector.color}40`,
          boxShadow: `0 0 16px ${sector.color}15`,
        }}
      >
        {/* Title */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm">{sector.icon}</span>
          <span
            className="display-font text-xs tracking-wider uppercase"
            style={{ color: sector.color }}
          >
            {sector.title}
          </span>
        </div>

        {/* Sector sub-label */}
        <div className="text-[8px] telemetry-font text-v2-text-muted uppercase tracking-[0.2em] mb-2 ml-6">
          (Sector {greekName})
        </div>

        {/* Progress count — prominent */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-1.5 rounded-full bg-v2-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                backgroundColor: progress.isComplete ? "#22c55e" : sector.color,
              }}
            />
          </div>
          <span
            className="text-sm telemetry-font font-semibold"
            style={{ color: sector.color }}
          >
            {progress.completedMissions}/{progress.totalMissions}
          </span>
        </div>

        {/* Jump to System indicator */}
        <div
          className="mt-2 pt-2 border-t border-v2-border text-center"
        >
          <span
            className="text-[9px] display-font tracking-[0.15em] uppercase"
            style={{ color: sector.color, textShadow: `0 0 8px ${sector.color}30` }}
          >
            Jump to System
          </span>
        </div>
      </div>
    </div>
  );
}
