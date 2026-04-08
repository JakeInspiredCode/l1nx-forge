"use client";

import GlowStat from "@/components/ui/glow-stat";

interface StatsPanelProps {
  totalXp: number;
  streak: number;
  sectorsExplored: number;
  totalSectors: number;
  missionsAccomplished: number;
  totalMissions: number;
  activeCampaignTitle?: string;
  activeCampaignPct?: number;
}

export default function StatsPanel({
  totalXp,
  streak,
  sectorsExplored,
  totalSectors,
  missionsAccomplished,
  totalMissions,
  activeCampaignTitle,
  activeCampaignPct,
}: StatsPanelProps) {
  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      {/* Title */}
      <h2
        className="display-font text-[10px] tracking-[0.2em] uppercase mb-4"
        style={{
          color: "var(--room-accent)",
          textShadow: "0 0 8px var(--room-accent-glow)",
        }}
      >
        Commander Overview
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <GlowStat label="Total XP" value={totalXp.toLocaleString()} size="sm" />
        <GlowStat label="Streak" value={`${streak}d`} size="sm" />
        <GlowStat label="Sectors" value={`${sectorsExplored}/${totalSectors}`} size="sm" />
        <GlowStat label="Missions" value={`${missionsAccomplished}/${totalMissions}`} size="sm" />
      </div>

      {/* Active campaign */}
      {activeCampaignTitle && (
        <div className="mt-auto pt-3 border-t border-v2-border">
          <span className="text-[9px] telemetry-font text-v2-text-muted uppercase tracking-wider block mb-1">
            Active Campaign
          </span>
          <span className="text-[11px] text-v2-text display-font tracking-wider">
            {activeCampaignTitle}
          </span>
          {activeCampaignPct !== undefined && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1 rounded-full bg-v2-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-v2-cyan transition-all duration-500"
                  style={{ width: `${activeCampaignPct}%` }}
                />
              </div>
              <span className="text-[9px] telemetry-font text-v2-text-muted">
                {activeCampaignPct}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
