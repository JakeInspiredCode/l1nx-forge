"use client";

import type { Sector, SectorProgress } from "@/lib/types/campaign";

interface SectorNodeProps {
  sector: Sector;
  progress: SectorProgress;
  onHover: (sector: Sector | null) => void;
  onClick: (sector: Sector) => void;
}

const SIZE_SCALE = { sm: 32, md: 42, lg: 56 };
const GLOW_SCALE = { sm: 60, md: 80, lg: 110 };

const SECTOR_GREEK: Record<string, string> = {
  "sector-linux": "Sector Alpha",
  "sector-hardware": "Sector Beta",
  "sector-networking": "Sector Gamma",
  "sector-fiber": "Sector Delta",
  "sector-power": "Sector Epsilon",
  "sector-ops": "Sector Zeta",
  "sector-scale": "Sector Eta",
  "sector-linux-advanced": "Sector Theta",
};

export default function SectorNode({ sector, progress, onHover, onClick }: SectorNodeProps) {
  const r = SIZE_SCALE[sector.size];
  const glowR = GLOW_SCALE[sector.size];
  const cx = sector.mapPosition.x * 10;
  const cy = sector.mapPosition.y * 10;

  const completionPct = progress.totalMissions > 0
    ? progress.completedMissions / progress.totalMissions
    : 0;

  const isActive = progress.hasVolunteered;
  const isComplete = progress.isComplete;

  // Progress ring
  const ringR = r + 5;
  const circumference = 2 * Math.PI * ringR;
  const dashOffset = circumference * (1 - completionPct);

  const greekName = SECTOR_GREEK[sector.id] ?? "";

  // Unique animation delay per sector for breathing offset
  const breatheDelay = `${(cx * 7 + cy * 13) % 4000}ms`;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(sector)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(sector)}
      style={{ filter: `drop-shadow(0 0 ${isActive ? 12 : 6}px ${sector.color}50)` }}
    >
      {/* Outer nebula glow — large soft radial */}
      <circle
        cx={cx}
        cy={cy}
        r={glowR}
        fill={`url(#nebula-${sector.id})`}
        opacity={isActive ? 0.35 : 0.18}
        className="sector-breathe"
        style={{ animationDelay: breatheDelay }}
      />

      {/* Mid glow ring — atmosphere */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 12}
        fill="none"
        stroke={sector.color}
        strokeWidth={0.6}
        opacity={isActive ? 0.2 : 0.08}
      />

      {/* Outer ring — thin orbit line */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 8}
        fill="none"
        stroke={sector.color}
        strokeWidth={0.4}
        opacity={isActive ? 0.3 : 0.1}
        strokeDasharray="3 6"
        className="sector-orbit"
        style={{ animationDelay: breatheDelay }}
      />

      {/* Core circle — glass effect */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#core-glass-${sector.id})`}
        stroke={sector.color}
        strokeWidth={isActive ? 1.8 : 1}
        opacity={isActive ? 1 : 0.75}
        className="transition-all duration-500"
      />

      {/* Inner highlight — top-edge specular */}
      <ellipse
        cx={cx}
        cy={cy - r * 0.35}
        rx={r * 0.6}
        ry={r * 0.25}
        fill="rgba(255, 255, 255, 0.06)"
      />

      {/* Center energy core */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.25}
        fill={`url(#energy-core-${sector.id})`}
        className="sector-breathe"
        style={{ animationDelay: breatheDelay }}
      />

      {/* Progress ring (only if volunteered) */}
      {isActive && (
        <>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={ringR}
            fill="none"
            stroke={sector.color}
            strokeWidth={2.5}
            opacity={0.1}
          />
          {/* Value arc */}
          <circle
            cx={cx}
            cy={cy}
            r={ringR}
            fill="none"
            stroke={isComplete ? "#22c55e" : sector.color}
            strokeWidth={2.5}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-700"
            style={{
              filter: `drop-shadow(0 0 4px ${isComplete ? "#22c55e" : sector.color})`,
            }}
          />
        </>
      )}

      {/* Title */}
      <text
        x={cx}
        y={cy + r + 14}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={isActive ? sector.color : "#e0e4ec"}
        fontSize={sector.size === "lg" ? 13 : sector.size === "md" ? 11 : 9.5}
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight={700}
        letterSpacing="0.12em"
        className="pointer-events-none select-none uppercase"
        style={{
          textShadow: isActive ? `0 0 10px ${sector.color}80` : "0 0 6px rgba(0,0,0,0.8)",
        }}
      >
        {sector.title}
      </text>

      {/* Greek sub-label */}
      <text
        x={cx}
        y={cy + r + (sector.size === "lg" ? 30 : 27)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill="#8eafc8"
        fontSize={8}
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight={600}
        letterSpacing="0.1em"
        className="pointer-events-none select-none"
        style={{ textShadow: "0 0 4px rgba(0,0,0,0.6)" }}
      >
        ({greekName})
      </text>

      {/* Mission count */}
      <text
        x={cx}
        y={cy + r + (sector.size === "lg" ? 42 : 39)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill="#8eafc8"
        fontSize={7.5}
        fontFamily="'JetBrains Mono', monospace"
        className="pointer-events-none select-none"
        style={{ textShadow: "0 0 4px rgba(0,0,0,0.6)" }}
      >
        {progress.completedMissions}/{progress.totalMissions} missions
      </text>

      {/* Gradient definitions */}
      <defs>
        <radialGradient id={`nebula-${sector.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sector.color} stopOpacity={0.5} />
          <stop offset="35%" stopColor={sector.color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={sector.color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`core-glass-${sector.id}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={sector.color} stopOpacity={0.12} />
          <stop offset="50%" stopColor="rgba(10, 12, 20, 1)" stopOpacity={0.9} />
          <stop offset="100%" stopColor="rgba(6, 8, 16, 1)" stopOpacity={0.95} />
        </radialGradient>
        <radialGradient id={`energy-core-${sector.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sector.color} stopOpacity={0.7} />
          <stop offset="60%" stopColor={sector.color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={sector.color} stopOpacity={0} />
        </radialGradient>
      </defs>
    </g>
  );
}
