"use client";

interface GalaxyHeaderProps {
  totalXp: number;
  streak: number;
  sectorsExplored: number;
  totalSectors: number;
}

export default function GalaxyHeader({
  totalXp,
  streak,
  sectorsExplored,
  totalSectors,
}: GalaxyHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1
          className="display-font text-base tracking-[0.2em] uppercase"
          style={{
            color: "var(--room-accent)",
            textShadow: "0 0 12px var(--room-accent-glow)",
          }}
        >
          Galaxy Map
        </h1>
        <span className="text-[10px] telemetry-font text-v2-text-muted tracking-wider uppercase">
          Sectors
        </span>
      </div>

      {/* HUD stats */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] telemetry-font text-v2-text-muted uppercase">XP</span>
          <span className="text-xs telemetry-font text-v2-cyan">{totalXp.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] telemetry-font text-v2-text-muted uppercase">Streak</span>
          <span className="text-xs telemetry-font text-v2-amber">{streak}d</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] telemetry-font text-v2-text-muted uppercase">Sectors</span>
          <span className="text-xs telemetry-font text-v2-text">
            {sectorsExplored}/{totalSectors}
          </span>
        </div>
      </div>
    </div>
  );
}
