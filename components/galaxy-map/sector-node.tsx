"use client";

import type { Sector, SectorProgress } from "@/lib/types/campaign";

interface SectorNodeProps {
  sector: Sector;
  progress: SectorProgress;
  onHover: (sector: Sector | null) => void;
  onClick: (sector: Sector) => void;
}

const SIZE_SCALE = { sm: 28, md: 36, lg: 46 };
const NEBULA_SCALE = { sm: 60, md: 80, lg: 110 };

export default function SectorNode({ sector, progress, onHover, onClick }: SectorNodeProps) {
  const r = SIZE_SCALE[sector.size];
  const nebulaR = NEBULA_SCALE[sector.size];
  const cx = sector.mapPosition.x * 10; // Scale 0-100 to viewBox 0-1000
  const cy = sector.mapPosition.y * 10; // Scale 0-100 to viewBox 0-800 (we'll use 8 factor in parent)

  const completionPct = progress.totalMissions > 0
    ? progress.completedMissions / progress.totalMissions
    : 0;

  const isActive = progress.hasVolunteered;
  const isComplete = progress.isComplete;

  // Progress ring
  const ringR = r + 4;
  const circumference = 2 * Math.PI * ringR;
  const dashOffset = circumference * (1 - completionPct);

  return (
    <g
      className="cursor-pointer transition-transform duration-200"
      onMouseEnter={() => onHover(sector)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(sector)}
      style={{ filter: isActive ? `drop-shadow(0 0 12px ${sector.color}40)` : undefined }}
    >
      {/* Nebula glow */}
      <circle
        cx={cx}
        cy={cy}
        r={nebulaR}
        fill={`url(#nebula-${sector.id})`}
        opacity={isActive ? 0.18 : 0.08}
        className="transition-opacity duration-500"
      />

      {/* Core circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="rgba(15, 17, 24, 0.8)"
        stroke={sector.color}
        strokeWidth={isActive ? 1.5 : 0.8}
        opacity={isActive ? 1 : 0.6}
        className="transition-all duration-300"
      />

      {/* Progress ring (only if volunteered) */}
      {isActive && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={ringR}
            fill="none"
            stroke={sector.color}
            strokeWidth={1.5}
            opacity={0.15}
          />
          <circle
            cx={cx}
            cy={cy}
            r={ringR}
            fill="none"
            stroke={isComplete ? "#22c55e" : sector.color}
            strokeWidth={1.5}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-700"
          />
        </>
      )}

      {/* Icon */}
      <text
        x={cx}
        y={cy - 4}
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
        y={cy + r - 6}
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
        y={cy + r + (sector.size === "lg" ? 8 : 5)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill="#444b5c"
        fontSize={6}
        fontFamily="'JetBrains Mono', monospace"
        className="pointer-events-none select-none"
      >
        {progress.totalMissions} missions
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
