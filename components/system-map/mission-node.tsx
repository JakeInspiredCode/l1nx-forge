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
  const isDecaying = status === "decaying";
  const isAccomplished = status === "accomplished";

  // Determine animation class
  let animClass = "";
  if (status === "available") animClass = "animate-[availablePulse_2s_ease-in-out_infinite]";
  if (isDecaying) animClass = "animate-[decayPulse_2s_ease-in-out_infinite]";
  if (isCurrent) animClass = "animate-[territoryPulse_2s_ease-in-out_infinite]";

  return (
    <g
      className={`${isInteractive ? "cursor-pointer" : "cursor-default"} transition-transform duration-200`}
      onMouseEnter={() => isInteractive && onHover(mission)}
      onMouseLeave={() => onHover(null)}
      onClick={() => isInteractive && onClick(mission)}
      style={colors.glow !== "none" ? { filter: `drop-shadow(0 0 8px ${colors.glow})` } : undefined}
    >
      {/* Orbit ring hint (faint) */}
      <circle
        cx={500}
        cy={400}
        r={Math.sqrt((cx - 500) ** 2 + (cy - 400) ** 2)}
        fill="none"
        stroke="#7a8298"
        strokeWidth={0.3}
        opacity={0.08}
        strokeDasharray="2 6"
      />

      {/* Celestial body */}
      {celestialType === "asteroid" && (
        <polygon
          points={asteroidPoints(cx, cy, size)}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={1}
          opacity={status === "locked" ? 0.3 : 0.9}
          className={animClass}
        />
      )}

      {celestialType === "moon" && (
        <circle
          cx={cx}
          cy={cy}
          r={size}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={1.2}
          opacity={status === "locked" ? 0.3 : 0.9}
          className={animClass}
        />
      )}

      {celestialType === "planet" && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={size}
            fill={`url(#planet-${mission.id})`}
            stroke={colors.stroke}
            strokeWidth={1.5}
            opacity={status === "locked" ? 0.3 : 0.9}
            className={animClass}
          />
          <defs>
            <radialGradient id={`planet-${mission.id}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colors.fill} />
            </radialGradient>
          </defs>
        </>
      )}

      {celestialType === "station" && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={size}
            fill={`url(#station-${mission.id})`}
            stroke={colors.stroke}
            strokeWidth={1.8}
            opacity={status === "locked" ? 0.3 : 0.9}
            className={animClass}
          />
          {/* Station ring */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={size + 6}
            ry={size * 0.35}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={0.8}
            opacity={status === "locked" ? 0.15 : 0.4}
          />
          <defs>
            <radialGradient id={`station-${mission.id}`} cx="30%" cy="30%">
              <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.4} />
              <stop offset="100%" stopColor={colors.fill} />
            </radialGradient>
          </defs>
        </>
      )}

      {/* Mission title (compact) */}
      <text
        x={cx}
        y={cy + size + 8}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={status === "locked" ? "#444b5c" : colors.stroke}
        fontSize={7}
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight={500}
        letterSpacing="0.08em"
        className="pointer-events-none select-none"
      >
        {mission.title.length > 18 ? mission.title.slice(0, 16) + "…" : mission.title}
      </text>

      {/* Status indicator for accomplished */}
      {isAccomplished && (
        <text
          x={cx + size - 2}
          y={cy - size + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={8}
          className="pointer-events-none select-none"
        >
          ✓
        </text>
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
