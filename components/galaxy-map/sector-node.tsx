"use client";

import type { Sector, SectorProgress } from "@/lib/types/campaign";

interface SectorNodeProps {
  sector: Sector;
  progress: SectorProgress;
  onHover: (sector: Sector | null) => void;
  onClick: (sector: Sector) => void;
}

const SIZE_SCALE = { sm: 25, md: 32, lg: 42 };
const NEBULA_SCALE = { sm: 55, md: 75, lg: 100 };

/** Flat-top hexagon points string for SVG polygon */
function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // flat-top: start at -30°
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

export default function SectorNode({ sector, progress, onHover, onClick }: SectorNodeProps) {
  const r = SIZE_SCALE[sector.size];
  const nebulaR = NEBULA_SCALE[sector.size];
  const cx = sector.mapPosition.x * 10;
  const cy = sector.mapPosition.y * 10;

  const completionPct = progress.totalMissions > 0
    ? progress.completedMissions / progress.totalMissions
    : 0;

  const isActive = progress.hasVolunteered;
  const isComplete = progress.isComplete;

  // Progress ring (hex perimeter)
  const ringR = r + 5;
  const perimeter = 6 * ringR; // regular hexagon side = radius
  const dashOffset = perimeter * (1 - completionPct);

  return (
    <g
      className="cursor-pointer transition-transform duration-200"
      onMouseEnter={() => onHover(sector)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(sector)}
      style={{ filter: isActive ? `drop-shadow(0 0 14px ${sector.color}50)` : undefined }}
    >
      {/* Nebula glow — radial gradient fills the hex area */}
      <circle
        cx={cx}
        cy={cy}
        r={nebulaR}
        fill={`url(#nebula-${sector.id})`}
        opacity={isActive ? 0.22 : 0.1}
        className="transition-opacity duration-500"
      />

      {/* Core hexagon */}
      <polygon
        points={hexPoints(cx, cy, r)}
        fill="rgba(10, 12, 20, 0.85)"
        stroke={sector.color}
        strokeWidth={isActive ? 1.8 : 1}
        opacity={isActive ? 1 : 0.65}
        className="transition-all duration-300"
        strokeLinejoin="round"
      />

      {/* Inner hex highlight (subtle top edge shine) */}
      <polygon
        points={hexPoints(cx, cy, r - 2)}
        fill="none"
        stroke="rgba(255, 255, 255, 0.06)"
        strokeWidth={0.5}
        strokeLinejoin="round"
      />

      {/* Progress ring (only if volunteered) */}
      {isActive && (
        <>
          {/* Background hex ring */}
          <polygon
            points={hexPoints(cx, cy, ringR)}
            fill="none"
            stroke={sector.color}
            strokeWidth={2}
            opacity={0.15}
            strokeLinejoin="round"
          />
          {/* Progress hex ring */}
          <polygon
            points={hexPoints(cx, cy, ringR)}
            fill="none"
            stroke={isComplete ? "#22c55e" : sector.color}
            strokeWidth={2}
            strokeDasharray={perimeter}
            strokeDashoffset={dashOffset}
            strokeLinejoin="round"
            className="transition-all duration-700"
          />
        </>
      )}

      {/* Icon */}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={sector.size === "lg" ? 20 : sector.size === "md" ? 16 : 13}
        className="pointer-events-none select-none"
      >
        {sector.icon}
      </text>

      {/* Title */}
      <text
        x={cx}
        y={cy + r + 2}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={isActive ? sector.color : "#7a8298"}
        fontSize={sector.size === "lg" ? 9 : 7.5}
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight={600}
        letterSpacing="0.12em"
        className="pointer-events-none select-none uppercase"
      >
        {sector.title}
      </text>

      {/* Mission count */}
      <text
        x={cx}
        y={cy + r + (sector.size === "lg" ? 14 : 12)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill="#444b5c"
        fontSize={6}
        fontFamily="'JetBrains Mono', monospace"
        className="pointer-events-none select-none"
      >
        {progress.completedMissions}/{progress.totalMissions} missions
      </text>

      {/* Radial gradient definition for nebula */}
      <defs>
        <radialGradient id={`nebula-${sector.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sector.color} stopOpacity={0.4} />
          <stop offset="60%" stopColor={sector.color} stopOpacity={0.1} />
          <stop offset="100%" stopColor={sector.color} stopOpacity={0} />
        </radialGradient>
      </defs>
    </g>
  );
}
