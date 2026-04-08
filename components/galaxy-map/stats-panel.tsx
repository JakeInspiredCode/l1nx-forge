"use client";

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

/** SVG circular gauge widget */
function CircularGauge({
  value,
  label,
  max,
  suffix,
  color,
}: {
  value: number;
  label: string;
  max?: number;
  suffix?: string;
  color: string;
}) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const pct = max ? Math.min(value / max, 1) : Math.min(value / 10000, 1);
  const dashOffset = circumference * (1 - pct);
  const displayValue = max ? `${value}/${max}` : suffix ? `${value}` : value.toLocaleString();

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="60" height="60" viewBox="0 0 60 60">
        {/* Background track */}
        <circle
          cx="30" cy="30" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          opacity={0.15}
        />
        {/* Value arc */}
        <circle
          cx="30" cy="30" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
          className="transition-all duration-700"
        />
        {/* Center value */}
        <text
          x="30" y={suffix ? "27" : "30"}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="10"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="600"
        >
          {displayValue}
        </text>
        {suffix && (
          <text
            x="30" y="38"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#7a8298"
            fontSize="6"
            fontFamily="'Chakra Petch', sans-serif"
            fontWeight="600"
            letterSpacing="0.1em"
          >
            {suffix}
          </text>
        )}
      </svg>
      <span className="text-[8px] display-font tracking-[0.15em] text-v2-text-muted uppercase">
        {label}
      </span>
    </div>
  );
}

const TECH_GLYPH_PLACEHOLDERS = ["⚙", "ψ", "⊕", "⬢", "§", "✧"];

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
    <div className="h-full flex flex-col p-3 overflow-auto scroll-container">
      {/* Circular gauges row */}
      <div className="flex items-center justify-around mb-4 mt-1">
        <CircularGauge value={totalXp} label="Total XP" color="#06d6d6" />
        <CircularGauge value={streak} label="Streak" suffix="DAYS" color="#f59e0b" max={30} />
        <CircularGauge
          value={missionsAccomplished}
          label="Missions"
          max={totalMissions}
          color="#22c55e"
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-v2-border mb-3" />

      {/* Active Missions */}
      <div className="mb-4">
        <h3
          className="text-[9px] display-font tracking-[0.18em] uppercase mb-2"
          style={{ color: "#06d6d6", textShadow: "0 0 6px rgba(6,214,214,0.2)" }}
        >
          Active Missions
        </h3>
        {activeCampaignTitle ? (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-v2-bg-elevated/40">
            <span className="text-[10px]">🎯</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-v2-text display-font tracking-wider block truncate">
                {activeCampaignTitle}
              </span>
              {activeCampaignPct !== undefined && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full bg-v2-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-v2-cyan transition-all duration-500"
                      style={{ width: `${activeCampaignPct}%` }}
                    />
                  </div>
                  <span className="text-[8px] telemetry-font text-v2-text-muted">
                    {activeCampaignPct}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-[9px] telemetry-font text-v2-text-muted">
            No active campaign
          </span>
        )}
      </div>

      {/* Tech-Glyphs Collected */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3
            className="text-[9px] display-font tracking-[0.18em] uppercase"
            style={{ color: "#06d6d6", textShadow: "0 0 6px rgba(6,214,214,0.2)" }}
          >
            Tech-Glyphs Collected
          </h3>
          <span className="text-[9px] telemetry-font text-v2-text-muted">0/18</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TECH_GLYPH_PLACEHOLDERS.map((glyph, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded flex items-center justify-center border border-v2-border text-[10px] text-v2-text-muted opacity-30"
            >
              {glyph}
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Status */}
      <div className="mt-auto pt-3 border-t border-v2-border">
        <h3
          className="text-[9px] display-font tracking-[0.18em] uppercase mb-2"
          style={{ color: "#06d6d6", textShadow: "0 0 6px rgba(6,214,214,0.2)" }}
        >
          Fleet Status
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[10px]">🚀</span>
            <span className="text-[9px] telemetry-font text-v2-text-muted">
              {sectorsExplored}/{totalSectors} sectors
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
