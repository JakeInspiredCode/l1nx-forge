"use client";

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
    <div
      className="flex items-center justify-between px-5 py-3 rounded-lg"
      style={{
        background: "rgba(5, 5, 8, 0.6)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(30, 34, 51, 0.4)",
      }}
    >
      {/* Left — callsign + campaign */}
      <div className="flex items-center gap-4">
        <div>
          <h1
            className="display-font text-lg tracking-[0.15em]"
            style={{
              color: "#06d6d6",
              textShadow: "0 0 12px rgba(6, 214, 214, 0.3)",
            }}
          >
            Star Map
          </h1>
          {activeCampaign && (
            <p className="text-[10px] telemetry-font text-v2-text-muted tracking-wider mt-0.5">
              Active: {activeCampaign}
            </p>
          )}
        </div>
      </div>

      {/* Right — telemetry readouts */}
      <div className="flex items-center gap-6">
        <HudStat value={totalXp.toLocaleString()} label="XP" />
        <HudStat value={streak.toString()} label="Streak" suffix="d" />
        <HudStat
          value={`${missionsAccomplished}`}
          label="Missions"
          suffix={`/${totalMissions}`}
        />
      </div>
    </div>
  );
}

function HudStat({
  value,
  label,
  suffix,
}: {
  value: string;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-baseline gap-0.5">
        <span
          className="telemetry-font text-lg font-bold"
          style={{
            color: "#06d6d6",
            textShadow: "0 0 8px rgba(6, 214, 214, 0.3)",
          }}
        >
          {value}
        </span>
        {suffix && (
          <span className="telemetry-font text-xs text-v2-text-muted">
            {suffix}
          </span>
        )}
      </div>
      <span className="text-[9px] uppercase tracking-[0.15em] text-v2-text-muted">
        {label}
      </span>
    </div>
  );
}
