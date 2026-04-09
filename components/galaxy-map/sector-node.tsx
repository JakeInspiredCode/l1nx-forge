"use client";

import type { Sector, SectorProgress } from "@/lib/types/campaign";

interface SectorNodeProps {
  sector: Sector;
  progress: SectorProgress;
  onHover: (sector: Sector | null) => void;
  onClick: (sector: Sector) => void;
}

const SIZE_SCALE = { sm: 38, md: 48, lg: 62 };
const NEBULA_SCALE = { sm: 80, md: 110, lg: 145 };

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
  const ringR = r + 6;
  const perimeter = 6 * ringR;
  const dashOffset = perimeter * (1 - completionPct);

  const greekName = SECTOR_GREEK[sector.id] ?? "";

  return (
    <g
      className="cursor-pointer transition-transform duration-200"
      onMouseEnter={() => onHover(sector)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(sector)}
      style={{
        filter: isActive
          ? `drop-shadow(0 0 18px ${sector.color}60) drop-shadow(0 0 6px ${sector.color}30)`
          : `drop-shadow(0 0 8px ${sector.color}20)`,
      }}
    >
      {/* Nebula glow — radial gradient fills the hex area */}
      <circle
        cx={cx}
        cy={cy}
        r={nebulaR}
        fill={`url(#nebula-${sector.id})`}
        opacity={isActive ? 0.28 : 0.14}
        className="transition-opacity duration-500"
      />

      {/* Outer hexagon border ring (always visible, subtle) */}
      <polygon
        points={hexPoints(cx, cy, r + 3)}
        fill="none"
        stroke={sector.color}
        strokeWidth={0.8}
        opacity={isActive ? 0.4 : 0.15}
        strokeLinejoin="round"
      />

      {/* Core hexagon */}
      <polygon
        points={hexPoints(cx, cy, r)}
        fill="rgba(8, 10, 18, 0.9)"
        stroke={sector.color}
        strokeWidth={isActive ? 2 : 1.2}
        opacity={isActive ? 1 : 0.7}
        className="transition-all duration-300"
        strokeLinejoin="round"
      />

      {/* Inner hex highlight (subtle top edge shine) */}
      <polygon
        points={hexPoints(cx, cy, r - 3)}
        fill="none"
        stroke="rgba(255, 255, 255, 0.05)"
        strokeWidth={0.5}
        strokeLinejoin="round"
      />

      {/* Inner glow circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.4}
        fill={`url(#inner-glow-${sector.id})`}
        opacity={isActive ? 0.3 : 0.12}
      />

      {/* Progress ring (only if volunteered) */}
      {isActive && (
        <>
          {/* Background hex ring */}
          <polygon
            points={hexPoints(cx, cy, ringR)}
            fill="none"
            stroke={sector.color}
            strokeWidth={2.5}
            opacity={0.12}
            strokeLinejoin="round"
          />
          {/* Progress hex ring */}
          <polygon
            points={hexPoints(cx, cy, ringR)}
            fill="none"
            stroke={isComplete ? "#22c55e" : sector.color}
            strokeWidth={2.5}
            strokeDasharray={perimeter}
            strokeDashoffset={dashOffset}
            strokeLinejoin="round"
            className="transition-all duration-700"
          />
        </>
      )}

      {/* Title */}
      <text
        x={cx}
        y={cy + r + 8}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={isActive ? sector.color : "#c8d6e5"}
        fontSize={sector.size === "lg" ? 14 : sector.size === "md" ? 12 : 10}
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight={700}
        letterSpacing="0.14em"
        className="pointer-events-none select-none uppercase"
      >
        {sector.title}
      </text>

      {/* Greek sub-label */}
      <text
        x={cx}
        y={cy + r + (sector.size === "lg" ? 26 : 23)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill="#8eafc8"
        fontSize={9}
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight={600}
        letterSpacing="0.1em"
        className="pointer-events-none select-none"
      >
        ({greekName})
      </text>

      {/* Mission count */}
      <text
        x={cx}
        y={cy + r + (sector.size === "lg" ? 40 : 36)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill="#8eafc8"
        fontSize={8}
        fontFamily="'JetBrains Mono', monospace"
        className="pointer-events-none select-none"
      >
        {progress.completedMissions}/{progress.totalMissions} missions
      </text>

      {/* Gradient definitions */}
      <defs>
        <radialGradient id={`nebula-${sector.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sector.color} stopOpacity={0.5} />
          <stop offset="40%" stopColor={sector.color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={sector.color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`inner-glow-${sector.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sector.color} stopOpacity={0.6} />
          <stop offset="100%" stopColor={sector.color} stopOpacity={0} />
        </radialGradient>
      </defs>
    </g>
  );
}
