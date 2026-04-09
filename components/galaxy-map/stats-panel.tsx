"use client";

import { useEffect, useState } from "react";

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

/** Glowing circular gauge with mount animation */
function GlowGauge({
  value,
  label,
  max,
  suffix,
  color,
  delay = 0,
}: {
  value: number;
  label: string;
  max?: number;
  suffix?: string;
  color: string;
  delay?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const r = 30;
  const circumference = 2 * Math.PI * r;
  const pct = max ? Math.min(value / max, 1) : Math.min(value / 10000, 1);
  const dashOffset = mounted ? circumference * (1 - pct) : circumference;
  const displayValue = max ? `${value}/${max}` : value.toLocaleString();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="78" height="78" viewBox="0 0 78 78">
          {/* Outer glow ring */}
          <circle
            cx="39" cy="39" r={r + 5}
            fill="none" stroke={color} strokeWidth="0.5"
            opacity={mounted ? 0.15 : 0}
            className="transition-opacity duration-700"
          />
          {/* Background track */}
          <circle
            cx="39" cy="39" r={r}
            fill="none" stroke={color} strokeWidth="3"
            opacity={0.08}
          />
          {/* Value arc — animated on mount */}
          <circle
            cx="39" cy="39" r={r}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 39 39)"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
          {/* Glass inner fill */}
          <circle
            cx="39" cy="39" r={r - 6}
            fill={`${color}06`}
            stroke={color}
            strokeWidth="0.3"
            opacity={0.3}
          />
          {/* Center value */}
          <text
            x="39" y={suffix ? "36" : "39"}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            fontSize="13"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="700"
            style={{ textShadow: `0 0 12px ${color}` }}
          >
            {displayValue}
          </text>
          {suffix && (
            <text
              x="39" y="48"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#8eafc8"
              fontSize="7"
              fontFamily="'Chakra Petch', sans-serif"
              fontWeight="600"
              letterSpacing="0.14em"
            >
              {suffix}
            </text>
          )}
        </svg>
      </div>
      <span className="text-[10px] display-font tracking-[0.15em] text-[#8eafc8] uppercase">
        {label}
      </span>
    </div>
  );
}

/** Mini constellation visualization */
function ConstellationMap() {
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
    <svg viewBox="0 0 110 72" className="w-full h-14 opacity-70">
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="#06d6d6" strokeWidth={0.5} opacity={0.2}
        />
      ))}
      <polyline
        points={`${nodes[0].x},${nodes[0].y} ${nodes[3].x},${nodes[3].y} ${nodes[7].x},${nodes[7].y} ${nodes[10].x},${nodes[10].y} ${nodes[13].x},${nodes[13].y}`}
        fill="none" stroke="#06d6d6" strokeWidth={1} opacity={0.4}
        strokeLinejoin="round"
      />
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={2} fill="#0a0b10" stroke="#06d6d6" strokeWidth={0.5} opacity={0.5} />
          <circle cx={n.x} cy={n.y} r={0.8} fill="#06d6d6" opacity={0.5} />
        </g>
      ))}
      {[0, 3, 7, 10, 13].map((idx) => (
        <circle key={idx} cx={nodes[idx].x} cy={nodes[idx].y} r={3.5} fill="#06d6d6" opacity={0.15} />
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
    <div className="h-full flex flex-col p-4 overflow-auto scroll-container">
      {/* Circular gauges row — staggered mount animation */}
      <div className="flex items-center justify-around mb-4 mt-1">
        <GlowGauge value={totalXp} label="Total XP" color="#06d6d6" delay={100} />
        <GlowGauge value={streak} label="Streak" suffix="DAYS" color="#f59e0b" max={30} delay={250} />
        <GlowGauge value={missionsAccomplished} label="Missions" max={totalMissions} color="#22c55e" delay={400} />
      </div>

      {/* Constellation map */}
      <div className="mb-4 px-1">
        <ConstellationMap />
      </div>

      {/* Divider — glass edge */}
      <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, transparent, rgba(6, 214, 214, 0.2), transparent)" }} />

      {/* Active Missions */}
      <div className="mb-5">
        <h3 className="stats-section-title">Active Missions</h3>
        {activeCampaignTitle ? (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-md"
            style={{
              background: "rgba(6, 214, 214, 0.04)",
              border: "1px solid rgba(6, 214, 214, 0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-[#06d6d6] shadow-[0_0_8px_rgba(6,214,214,0.5)]" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-[#e0e4ec] display-font tracking-wider block truncate">
                {activeCampaignTitle}
              </span>
              {activeCampaignPct !== undefined && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(6, 214, 214, 0.1)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${activeCampaignPct}%`,
                        background: "linear-gradient(90deg, #06d6d6, #06d6d6cc)",
                        boxShadow: "0 0 8px rgba(6,214,214,0.4)",
                      }}
                    />
                  </div>
                  <span className="text-[9px] telemetry-font text-[#8eafc8]">
                    {activeCampaignPct}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-[10px] telemetry-font text-[#6a7288] italic">
            No active missions
          </span>
        )}
      </div>

      {/* Tech-Glyphs Collected */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="stats-section-title mb-0">Tech-Glyphs Collected</h3>
          <span className="text-[9px] telemetry-font text-[#6a7288]">0/18</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TECH_GLYPH_ICONS.map((glyph, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] transition-all duration-200"
              style={{
                border: "1px solid rgba(6, 214, 214, 0.08)",
                color: "#6a7288",
                background: "rgba(6, 214, 214, 0.02)",
              }}
            >
              {glyph}
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Status */}
      <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(6, 214, 214, 0.08)" }}>
        <h3 className="stats-section-title">Fleet Status</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {[0.5, 0.35, 0.25].map((opacity, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: "#06d6d6",
                  opacity,
                  boxShadow: `0 0 6px rgba(6, 214, 214, ${opacity})`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] telemetry-font text-[#8eafc8]">
            {sectorsExplored}/{totalSectors} sectors
          </span>
        </div>
      </div>
    </div>
  );
}
