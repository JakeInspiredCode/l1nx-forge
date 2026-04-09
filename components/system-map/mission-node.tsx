"use client";

import type { Mission, MissionStatus } from "@/lib/types/campaign";
import { MISSION_NODE_COLORS } from "@/lib/design/forge-v2-tokens";

interface MissionNodeProps {
  mission: Mission;
  status: MissionStatus;
  cx: number;
  cy: number;
  size: number;
  celestialType: "asteroid" | "moon" | "planet" | "station";
  isCurrent: boolean;
  onHover: (mission: Mission | null) => void;
  onClick: (mission: Mission) => void;
}

// Deterministic hash from mission id → consistent per-planet look
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Planet surface color palettes — each planet gets a unique combo
const SURFACE_PALETTES = [
  { base: "#1a6b8a", mid: "#2d9bb5", light: "#5cc8e0" },  // ocean world
  { base: "#8b4513", mid: "#cd853f", light: "#deb887" },  // desert
  { base: "#2d5a27", mid: "#4a8c3f", light: "#7bc96f" },  // forest
  { base: "#6b3a7a", mid: "#9b59b6", light: "#c39bd3" },  // purple gas
  { base: "#8b0000", mid: "#cd5c5c", light: "#f08080" },  // mars-like
  { base: "#1c3d5a", mid: "#2e6b9e", light: "#5dade2" },  // ice giant
  { base: "#b8860b", mid: "#daa520", light: "#f4d03f" },  // golden gas
  { base: "#3a5f3a", mid: "#5f8a5f", light: "#88bb88" },  // mossy
  { base: "#4a4a6a", mid: "#6a6a8a", light: "#9a9aba" },  // grey rock
  { base: "#7a3b2e", mid: "#a0522d", light: "#d2691e" },  // volcanic
  { base: "#2a4a6a", mid: "#4682b4", light: "#87ceeb" },  // gas blue
  { base: "#5a3a5a", mid: "#8a5a8a", light: "#ba8aba" },  // lavender gas
];

export default function MissionNode({
  mission,
  status,
  cx,
  cy,
  size,
  celestialType,
  isCurrent,
  onHover,
  onClick,
}: MissionNodeProps) {
  const colors = MISSION_NODE_COLORS[status];
  const isInteractive = status !== "locked";
  const isAccomplished = status === "accomplished";
  const isLocked = status === "locked";

  const h = hashId(mission.id);
  const palette = SURFACE_PALETTES[h % SURFACE_PALETTES.length];
  const orbitRadius = Math.sqrt((cx - 500) ** 2 + (cy - 400) ** 2);

  // Some planets get moons
  const hasMoon = !isLocked && (celestialType === "planet" || celestialType === "station") && h % 3 === 0;
  const moonAngle = (h % 360) * (Math.PI / 180);
  const moonDist = size + 6 + (h % 4);
  const moonSize = 2 + (h % 2);

  // Animation
  let animClass = "";
  if (status === "available") animClass = "animate-[availablePulse_2s_ease-in-out_infinite]";
  if (status === "decaying") animClass = "animate-[decayPulse_2s_ease-in-out_infinite]";
  if (isCurrent) animClass = "animate-[territoryPulse_2s_ease-in-out_infinite]";

  const lockedOpacity = 0.25;

  return (
    <g
      className={`${isInteractive ? "cursor-pointer sector-node" : "cursor-default"} transition-transform duration-200`}
      onMouseEnter={() => isInteractive && onHover(mission)}
      onMouseLeave={() => onHover(null)}
      onClick={() => isInteractive && onClick(mission)}
      style={{
        ["--sector-color" as string]: colors.stroke,
        ...(colors.glow !== "none" ? { filter: `drop-shadow(0 0 10px ${colors.glow})` } : {}),
      }}
    >
      {/* Invisible hit area */}
      <circle cx={cx} cy={cy} r={Math.max(size + 10, 20)} fill="transparent" />

      {/* Orbit ring */}
      <circle
        cx={500} cy={400} r={orbitRadius}
        fill="none" stroke={isLocked ? "#2a2e3a" : "#4a5568"}
        strokeWidth={0.4} opacity={0.2}
        strokeDasharray={isLocked ? "2 6" : "none"}
      />

      {/* ─── ASTEROID ─── */}
      {celestialType === "asteroid" && (
        <>
          <polygon
            points={asteroidPoints(cx, cy, size)}
            fill={isLocked ? "#1a1e28" : palette.base}
            stroke={isLocked ? "#2a2e3a" : palette.mid}
            strokeWidth={0.8}
            opacity={isLocked ? lockedOpacity : 0.9}
            className={animClass}
          />
          {/* Surface craters */}
          {!isLocked && (
            <>
              <circle cx={cx - size * 0.2} cy={cy + size * 0.1} r={size * 0.15} fill={palette.base} opacity={0.5} />
              <circle cx={cx + size * 0.25} cy={cy - size * 0.15} r={size * 0.1} fill={palette.base} opacity={0.4} />
            </>
          )}
        </>
      )}

      {/* ─── MOON / ROCKY WORLD ─── */}
      {celestialType === "moon" && (
        <>
          <circle
            cx={cx} cy={cy} r={size}
            fill={isLocked ? "#1a1e28" : `url(#rocky-${mission.id})`}
            stroke={isLocked ? "#2a2e3a" : palette.mid}
            strokeWidth={0.8}
            opacity={isLocked ? lockedOpacity : 1}
            className={animClass}
          />
          {/* Terminator shadow — day/night line */}
          {!isLocked && (
            <ellipse
              cx={cx + size * 0.3} cy={cy}
              rx={size * 0.7} ry={size}
              fill="rgba(0,0,0,0.3)"
              clipPath={`circle(${size}px at ${cx}px ${cy}px)`}
            />
          )}
          {/* Specular highlight */}
          {!isLocked && (
            <ellipse
              cx={cx - size * 0.3} cy={cy - size * 0.3}
              rx={size * 0.35} ry={size * 0.25}
              fill="rgba(255,255,255,0.12)"
            />
          )}
          <defs>
            <radialGradient id={`rocky-${mission.id}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor={palette.light} />
              <stop offset="50%" stopColor={palette.mid} />
              <stop offset="100%" stopColor={palette.base} />
            </radialGradient>
          </defs>
        </>
      )}

      {/* ─── PLANET / TERRESTRIAL ─── */}
      {celestialType === "planet" && (
        <>
          {/* Atmosphere haze */}
          {!isLocked && (
            <circle
              cx={cx} cy={cy} r={size + 3}
              fill="none" stroke={palette.light}
              strokeWidth={1.5} opacity={0.1}
            />
          )}
          {/* Planet body */}
          <circle
            cx={cx} cy={cy} r={size}
            fill={isLocked ? "#1a1e28" : `url(#globe-${mission.id})`}
            stroke={isLocked ? "#2a2e3a" : palette.mid}
            strokeWidth={1}
            opacity={isLocked ? lockedOpacity : 1}
            className={animClass}
          />
          {/* Surface band lines — gas giant stripes or continental hints */}
          {!isLocked && size >= 14 && (
            <>
              <ellipse cx={cx} cy={cy - size * 0.3} rx={size * 0.9} ry={size * 0.08} fill={palette.light} opacity={0.12} />
              <ellipse cx={cx} cy={cy + size * 0.15} rx={size * 0.95} ry={size * 0.06} fill={palette.base} opacity={0.15} />
              <ellipse cx={cx} cy={cy + size * 0.5} rx={size * 0.8} ry={size * 0.05} fill={palette.light} opacity={0.08} />
            </>
          )}
          {/* 3D specular */}
          {!isLocked && (
            <ellipse
              cx={cx - size * 0.25} cy={cy - size * 0.25}
              rx={size * 0.4} ry={size * 0.3}
              fill="rgba(255,255,255,0.1)"
            />
          )}
          <defs>
            <radialGradient id={`globe-${mission.id}`} cx="38%" cy="32%">
              <stop offset="0%" stopColor={palette.light} stopOpacity={0.9} />
              <stop offset="40%" stopColor={palette.mid} />
              <stop offset="100%" stopColor={palette.base} />
            </radialGradient>
          </defs>
        </>
      )}

      {/* ─── STATION / GAS GIANT WITH RINGS ─── */}
      {celestialType === "station" && (
        <>
          {/* Outer atmosphere */}
          {!isLocked && (
            <circle
              cx={cx} cy={cy} r={size + 5}
              fill={`url(#atmo-${mission.id})`}
            />
          )}
          {/* Planet body */}
          <circle
            cx={cx} cy={cy} r={size}
            fill={isLocked ? "#1a1e28" : `url(#giant-${mission.id})`}
            stroke={isLocked ? "#2a2e3a" : palette.mid}
            strokeWidth={1.2}
            opacity={isLocked ? lockedOpacity : 1}
            className={animClass}
          />
          {/* Gas band stripes */}
          {!isLocked && (
            <>
              <ellipse cx={cx} cy={cy - size * 0.4} rx={size * 0.95} ry={size * 0.07} fill={palette.light} opacity={0.15} />
              <ellipse cx={cx} cy={cy - size * 0.1} rx={size} ry={size * 0.05} fill={palette.base} opacity={0.2} />
              <ellipse cx={cx} cy={cy + size * 0.2} rx={size * 0.9} ry={size * 0.06} fill={palette.light} opacity={0.1} />
              <ellipse cx={cx} cy={cy + size * 0.5} rx={size * 0.85} ry={size * 0.05} fill={palette.mid} opacity={0.12} />
            </>
          )}
          {/* Ring system */}
          <ellipse
            cx={cx} cy={cy}
            rx={size * 1.6} ry={size * 0.35}
            fill="none"
            stroke={isLocked ? "#2a2e3a" : palette.light}
            strokeWidth={isLocked ? 0.5 : 2}
            opacity={isLocked ? 0.1 : 0.25}
          />
          <ellipse
            cx={cx} cy={cy}
            rx={size * 1.45} ry={size * 0.3}
            fill="none"
            stroke={isLocked ? "#2a2e3a" : palette.mid}
            strokeWidth={isLocked ? 0.3 : 1}
            opacity={isLocked ? 0.08 : 0.15}
          />
          {/* Specular */}
          {!isLocked && (
            <ellipse
              cx={cx - size * 0.2} cy={cy - size * 0.25}
              rx={size * 0.35} ry={size * 0.25}
              fill="rgba(255,255,255,0.08)"
            />
          )}
          <defs>
            <radialGradient id={`giant-${mission.id}`} cx="40%" cy="35%">
              <stop offset="0%" stopColor={palette.light} stopOpacity={0.8} />
              <stop offset="35%" stopColor={palette.mid} />
              <stop offset="100%" stopColor={palette.base} />
            </radialGradient>
            <radialGradient id={`atmo-${mission.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor={palette.light} stopOpacity={0} />
              <stop offset="90%" stopColor={palette.light} stopOpacity={0.06} />
              <stop offset="100%" stopColor={palette.light} stopOpacity={0} />
            </radialGradient>
          </defs>
        </>
      )}

      {/* ─── ORBITING MOON (small satellite) ─── */}
      {hasMoon && (
        <g>
          {/* Moon orbit track */}
          <circle
            cx={cx} cy={cy} r={moonDist}
            fill="none" stroke={palette.mid}
            strokeWidth={0.3} opacity={0.15}
            strokeDasharray="1 3"
          />
          {/* Moon body */}
          <circle
            cx={cx + Math.cos(moonAngle) * moonDist}
            cy={cy + Math.sin(moonAngle) * moonDist}
            r={moonSize}
            fill={palette.mid}
            opacity={0.6}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${cx} ${cy}`}
              to={`360 ${cx} ${cy}`}
              dur={`${8 + (h % 6)}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}

      {/* Mission title */}
      <text
        x={cx}
        y={cy + size + (hasMoon ? 12 : 10)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={isLocked ? "#3a3e4a" : "#c8d6e5"}
        fontSize={7.5}
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight={600}
        letterSpacing="0.06em"
        className="pointer-events-none select-none"
        style={{ textShadow: isLocked ? "none" : "0 0 4px rgba(0,0,0,0.8)" }}
      >
        {mission.title.length > 20 ? mission.title.slice(0, 18) + "…" : mission.title}
      </text>

      {/* Accomplished indicator */}
      {isAccomplished && (
        <circle
          cx={cx + size - 1} cy={cy - size + 1} r={3}
          fill="#22c55e"
          style={{ filter: "drop-shadow(0 0 4px #22c55e)" }}
        />
      )}
    </g>
  );
}

function asteroidPoints(cx: number, cy: number, size: number): string {
  const points = 7;
  const coords: string[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const r = size * (0.7 + Math.sin(i * 2.7) * 0.3);
    coords.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
  }
  return coords.join(" ");
}
