"use client";

import GlowStat from "@/components/ui/glow-stat";

interface MapHeaderProps {
  totalXp: number;
  streak: number;
  missionsAccomplished: number;
  totalMissions: number;
  activeCampaign?: string;
}

export default function MapHeader({
  totalXp,
  streak,
  missionsAccomplished,
  totalMissions,
  activeCampaign,
}: MapHeaderProps) {
  return (
    <div className="hex-panel p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-font text-xl text-v2-cyan tracking-widest">
            Star Map
          </h1>
          {activeCampaign && (
            <p className="text-xs text-v2-text-dim mt-0.5">
              Active: {activeCampaign}
            </p>
          )}
        </div>
        <div className="flex items-center gap-6">
          <GlowStat value={totalXp} label="XP" size="sm" />
          <GlowStat value={streak} label="Streak" icon="🔥" size="sm" />
          <GlowStat
            value={`${missionsAccomplished}/${totalMissions}`}
            label="Missions"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
