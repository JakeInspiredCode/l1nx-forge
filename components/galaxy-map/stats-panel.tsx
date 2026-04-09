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

/** SVG circular gauge widget — larger and more polished */
function CircularGauge({
  value,
  label,
  max,
  suffix,
  color,
  secondaryColor,
}: {
  value: number;
  label: string;
  max?: number;
  suffix?: string;
  color: string;
  secondaryColor?: string;
}) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const pct = max ? Math.min(value / max, 1) : Math.min(value / 10000, 1);
  const dashOffset = circumference * (1 - pct);
  const displayValue = max ? `${value}/${max}` : value.toLocaleString();
  const sc = secondaryColor || color;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="72" height="72" viewBox="0 0 72 72">
        {/* Outer glow ring */}
        <circle
          cx="36" cy="36" r={r + 3}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          opacity={0.15}
        />
        {/* Background track */}
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          opacity={0.12}
        />
        {/* Value arc */}
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          className="transition-all duration-700"
        />
        {/* Inner subtle fill */}
        <circle
          cx="36" cy="36" r={r - 5}
          fill={`${color}08`}
        />
        {/* Center value */}
        <text
          x="36" y={suffix ? "33" : "36"}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="12"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="700"
        >
          {displayValue}
        </text>
        {suffix && (
          <text
            x="36" y="44"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#9aa4b8"
            fontSize="7"
            fontFamily="'Chakra Petch', sans-serif"
            fontWeight="600"
            letterSpacing="0.12em"
          >
            {suffix}
          </text>
        )}
        {/* Completion check mark */}
        {max && value >= max && (
          <text
            x="56" y="56"
            textAnchor="middle"
            dominantBaseline="central"
            fill={sc}
            fontSize="10"
          >
            ✓
          </text>
        )}
      </svg>
      <span className="text-[9px] display-font tracking-[0.15em] text-v2-text-muted uppercase">
        {label}
      </span>
    </div>
  );
}

/** Constellation / star map mini-visualization */
function ConstellationMap() {
  // Fixed constellation nodes to match the mockup's star-path visualization
  const nodes = [
    { x: 20, y: 15 }, { x: 50, y: 10 }, { x: 80, y: 18 },
    { x: 35, y: 30 }, { x: 65, y: 25 }, { x: 90, y: 32 },
    { x: 15, y: 45 }, { x: 45, y: 40 }, { x: 75, y: 42 },
    { x: 25, y: 55 }, { x: 55, y: 52 }, { x: 85, y: 50 },
    { x: 40, y: 65 }, { x: 70, y: 60 }, { x: 95, y: 58 },
  ];
  const links = [
    [0,1],[1,2],[0,3],[1,4],[2,5],[3,7],[4,8],[6,7],[7,10],[8,11],
    [9,10],[10,13],[11,14],[12,13],
  ];
  return (
    <svg viewBox="0 0 110 72" className="w-full h-12 opacity-60">
      {/* Connection lines */}
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="#06d6d6"
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}
      {/* Flowing path highlight */}
      <polyline
        points={`${nodes[0].x},${nodes[0].y} ${nodes[3].x},${nodes[3].y} ${nodes[7].x},${nodes[7].y} ${nodes[10].x},${nodes[10].y} ${nodes[13].x},${nodes[13].y}`}
        fill="none"
        stroke="#06d6d6"
        strokeWidth={1.2}
        opacity={0.5}
        strokeLinejoin="round"
      />
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={2.5} fill="#0a0b10" stroke="#06d6d6" strokeWidth={0.6} opacity={0.6} />
          <circle cx={n.x} cy={n.y} r={1} fill="#06d6d6" opacity={0.4} />
        </g>
      ))}
      {/* Accent dots on path */}
      {[0, 3, 7, 10, 13].map((idx) => (
        <circle key={idx} cx={nodes[idx].x} cy={nodes[idx].y} r={3} fill="#06d6d6" opacity={0.25} />
      ))}
    </svg>
  );
}

const TECH_GLYPH_ICONS = ["⚙", "ψ", "⊕", "⬢", "§", "✧", "⟁", "◈", "⧫"];

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
      <div className="flex items-center justify-around mb-3 mt-1">
        <CircularGauge value={totalXp} label="Total XP" color="#06d6d6" />
        <CircularGauge value={streak} label="Streak" suffix="DAYS" color="#f59e0b" secondaryColor="#22c55e" max={30} />
        <CircularGauge
          value={missionsAccomplished}
          label="Missions"
          max={totalMissions}
          color="#22c55e"
        />
      </div>

      {/* Constellation map visualization */}
      <div className="mb-3 px-1">
        <ConstellationMap />
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
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-v2-bg-elevated/40 border border-v2-border/50">
            <span className="text-[10px]">🎯</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-v2-text display-font tracking-wider block truncate">
                {activeCampaignTitle}
              </span>
              {activeCampaignPct !== undefined && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-v2-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${activeCampaignPct}%`,
                        background: "linear-gradient(90deg, #06d6d6, #06d6d6cc)",
                        boxShadow: "0 0 6px rgba(6,214,214,0.3)",
                      }}
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
          <span className="text-[9px] telemetry-font text-v2-text-muted italic">
            Scoped for Active Missions
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
          {TECH_GLYPH_ICONS.map((glyph, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded flex items-center justify-center border text-[11px] transition-all duration-200"
              style={{
                borderColor: "rgba(42, 46, 62, 0.6)",
                color: "#8a92a8",
                opacity: 0.35,
                background: "rgba(15, 17, 24, 0.4)",
              }}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Ship icons */}
            <svg viewBox="0 0 20 10" fill="none" className="w-5 h-3">
              <path d="M1 5h6l3-3h4l4 3-4 3H10l-3-3" stroke="#06d6d6" strokeWidth="0.8" opacity="0.5" />
            </svg>
            <svg viewBox="0 0 20 10" fill="none" className="w-5 h-3">
              <path d="M2 5l6-3v6l-6-3zM10 5l6-3v6l-6-3z" stroke="#06d6d6" strokeWidth="0.8" opacity="0.4" />
            </svg>
            <svg viewBox="0 0 20 12" fill="none" className="w-5 h-3">
              <path d="M4 6l6-4v8l-6-4zM12 2l4 4-4 4" stroke="#06d6d6" strokeWidth="0.8" opacity="0.35" />
            </svg>
          </div>
          <span className="text-[9px] telemetry-font text-v2-text-muted">
            {sectorsExplored}/{totalSectors} sectors
          </span>
        </div>
      </div>
    </div>
  );
}
