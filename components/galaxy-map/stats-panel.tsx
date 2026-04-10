"use client";

import { useEffect, useRef, useState } from "react";
import ReadinessRadar from "./readiness-radar";

interface StatsPanelProps {
  totalXp: number;
  streak: number;
  sectorsExplored: number;
  totalSectors: number;
  missionsAccomplished: number;
  totalMissions: number;
  activeCampaignTitle?: string;
  activeCampaignPct?: number;
  topicProgress: { topicId: string; masteryPercent: number }[];
}

type PanelSize = "full" | "mid" | "compact";

/** Glowing circular gauge — scales with size prop */
function GlowGauge({
  value,
  label,
  max,
  suffix,
  color,
  delay = 0,
  size = "full",
}: {
  value: number;
  label: string;
  max?: number;
  suffix?: string;
  color: string;
  delay?: number;
  size?: "full" | "mid";
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

  const px = size === "mid" ? "38px" : "52px";
  const labelSize = size === "mid" ? "text-[7px]" : "text-[8px]";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: px, height: px }}>
        <svg width="100%" height="100%" viewBox="0 0 78 78">
          <circle
            cx="39" cy="39" r={r + 5}
            fill="none" stroke={color} strokeWidth="0.5"
            opacity={mounted ? 0.15 : 0}
            className="transition-opacity duration-700"
          />
          <circle
            cx="39" cy="39" r={r}
            fill="none" stroke={color} strokeWidth="3"
            opacity={0.08}
          />
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
          <circle
            cx="39" cy="39" r={r - 6}
            fill={`${color}06`}
            stroke={color}
            strokeWidth="0.3"
            opacity={0.3}
          />
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
      <span className={`${labelSize} display-font tracking-[0.14em] text-[#8eafc8] uppercase`}>
        {label}
      </span>
    </div>
  );
}

/** Single inline stat: colored dot + value + label */
function InlineStat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 4px ${color}60` }}
      />
      <span
        className="text-[11px] telemetry-font font-semibold text-v2-text truncate"
        style={{ textShadow: `0 0 8px ${color}30` }}
      >
        {value}
      </span>
      <span className="text-[7px] display-font tracking-[0.12em] text-[#6a7288] uppercase shrink-0">
        {label}
      </span>
    </div>
  );
}

// Panel height thresholds
const MID_THRESHOLD = 500;     // below this: shrink gauges
const COMPACT_THRESHOLD = 360; // below this: collapse to inline text

export default function StatsPanel({
  totalXp,
  streak,
  sectorsExplored,
  totalSectors,
  missionsAccomplished,
  totalMissions,
  activeCampaignTitle,
  activeCampaignPct,
  topicProgress,
}: StatsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelSize, setPanelSize] = useState<PanelSize>("full");

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      setPanelSize(h < COMPACT_THRESHOLD ? "compact" : h < MID_THRESHOLD ? "mid" : "full");
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={panelRef} className="h-full flex flex-col p-3 overflow-hidden">
      {/* Stats — 3 tiers: full gauges → small gauges → inline text */}
      {panelSize === "compact" ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
          <InlineStat value={totalXp.toLocaleString()} label="XP" color="#06d6d6" />
          <InlineStat value={`${streak}d`} label="Streak" color="#f59e0b" />
          <InlineStat value={`${missionsAccomplished}/${totalMissions}`} label="Missions" color="#22c55e" />
          <InlineStat value={`${sectorsExplored}/${totalSectors}`} label="Sectors" color="#a855f7" />
        </div>
      ) : (
        <div className={`grid grid-cols-2 justify-items-center mb-2 ${panelSize === "mid" ? "gap-1" : "gap-1.5"}`}>
          <GlowGauge value={totalXp} label="Total XP" color="#06d6d6" delay={100} size={panelSize} />
          <GlowGauge value={streak} label="Streak" suffix="DAYS" color="#f59e0b" max={30} delay={250} size={panelSize} />
          <GlowGauge value={missionsAccomplished} label="Missions" max={totalMissions} color="#22c55e" delay={400} size={panelSize} />
          <GlowGauge value={sectorsExplored} label="Sectors" max={totalSectors} color="#a855f7" delay={550} size={panelSize} />
        </div>
      )}

      {/* Active Mission */}
      {activeCampaignTitle && (
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md mb-2"
          style={{
            background: "rgba(6, 214, 214, 0.04)",
            border: "1px solid rgba(6, 214, 214, 0.1)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#06d6d6] shadow-[0_0_6px_rgba(6,214,214,0.5)] shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-[#e0e4ec] display-font tracking-wider block truncate">
              {activeCampaignTitle}
            </span>
            {activeCampaignPct !== undefined && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(6, 214, 214, 0.1)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${activeCampaignPct}%`,
                      background: "linear-gradient(90deg, #06d6d6, #06d6d6cc)",
                      boxShadow: "0 0 6px rgba(6,214,214,0.4)",
                    }}
                  />
                </div>
                <span className="text-[8px] telemetry-font text-[#8eafc8]">
                  {activeCampaignPct}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider + Readiness radar — hidden on mobile, takes remaining space on desktop */}
      <div className="max-md:hidden flex flex-1 min-h-0 flex-col">
        <div className="h-px mb-2 shrink-0" style={{ background: "linear-gradient(90deg, transparent, rgba(6, 214, 214, 0.2), transparent)" }} />
        <div className="flex-1 min-h-0">
          <ReadinessRadar progress={topicProgress} />
        </div>
      </div>
    </div>
  );
}
