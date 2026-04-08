"use client";

import type { Campaign, Mission, MissionStatus } from "@/lib/types/campaign";
import { MISSION_NODE_COLORS } from "@/lib/design/forge-v2-tokens";

interface ConstellationClusterProps {
  campaign: Campaign;
  missions: Mission[];
  missionStates: Record<string, MissionStatus>;
  completedCount: number;
  enrolled: boolean;
  onMissionClick: (missionId: string) => void;
  onEnroll: (campaignId: string) => void;
}

// Generate constellation node positions in an interesting pattern
function generatePositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const cols = Math.min(count, 4);
  const padding = 36;
  const spacingX = 60;
  const spacingY = 55;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    // Offset every other row for constellation feel
    const offsetX = row % 2 === 1 ? spacingX * 0.5 : 0;
    // Add slight randomization for organic feel
    const jitterX = (Math.sin(i * 2.7) * 8);
    const jitterY = (Math.cos(i * 3.1) * 6);

    positions.push({
      x: padding + col * spacingX + offsetX + jitterX,
      y: padding + row * spacingY + jitterY,
    });
  }
  return positions;
}

const statusLabel: Record<MissionStatus, string> = {
  locked: "Locked",
  available: "Ready",
  "in-progress": "In Progress",
  accomplished: "Claimed",
  decaying: "Decaying",
};

export default function ConstellationCluster({
  campaign,
  missions,
  missionStates,
  completedCount,
  enrolled,
  onMissionClick,
  onEnroll,
}: ConstellationClusterProps) {
  const positions = generatePositions(missions.length);
  const isComplete = completedCount === missions.length && missions.length > 0;
  const progress = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

  // Calculate SVG viewport
  const maxX = Math.max(...positions.map((p) => p.x)) + 50;
  const maxY = Math.max(...positions.map((p) => p.y)) + 50;
  const svgWidth = Math.max(maxX, 260);
  const svgHeight = Math.max(maxY, 100);

  return (
    <div className="relative group">
      {/* Campaign label — holographic floating text */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2
            className="display-font text-sm tracking-wider"
            style={{
              color: isComplete ? "#22c55e" : "#06d6d6",
              textShadow: `0 0 12px ${isComplete ? "rgba(34,197,94,0.3)" : "rgba(6,214,214,0.3)"}`,
              opacity: 0.9,
            }}
          >
            {campaign.icon} {campaign.title}
          </h2>
          <p className="text-[11px] text-v2-text-muted mt-0.5 max-w-[280px] line-clamp-1">
            {campaign.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(enrolled || completedCount > 0) && (
            <span className="text-[10px] telemetry-font text-v2-text-dim">
              {completedCount}/{missions.length}
            </span>
          )}
          {!enrolled && !isComplete && (
            <button
              onClick={() => onEnroll(campaign.id)}
              className="px-3 py-1 text-[10px] font-semibold rounded tracking-wider uppercase
                bg-v2-cyan/10 text-v2-cyan border border-v2-cyan/30
                hover:bg-v2-cyan/20 hover:border-v2-cyan/50 transition-all duration-200"
              style={{ fontFamily: "'Chakra Petch', sans-serif" }}
            >
              Enroll
            </button>
          )}
        </div>
      </div>

      {/* Constellation SVG */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: "rgba(5, 5, 8, 0.4)",
          border: "1px solid rgba(30, 34, 51, 0.5)",
          backdropFilter: "blur(2px)",
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
          style={{ minHeight: 120 }}
        >
          {/* Connection lines between sequential nodes */}
          {positions.map((pos, i) => {
            if (i === 0) return null;
            const prev = positions[i - 1];
            const status = missionStates[missions[i]?.id] ?? "locked";
            const prevStatus = missionStates[missions[i - 1]?.id] ?? "locked";
            const bothAccomplished =
              status === "accomplished" && prevStatus === "accomplished";
            const eitherAccomplished =
              status === "accomplished" || prevStatus === "accomplished";

            return (
              <line
                key={`line-${i}`}
                x1={prev.x}
                y1={prev.y}
                x2={pos.x}
                y2={pos.y}
                stroke={
                  bothAccomplished
                    ? "#06d6d6"
                    : eitherAccomplished
                    ? "rgba(6, 214, 214, 0.3)"
                    : "rgba(30, 34, 51, 0.6)"
                }
                strokeWidth={bothAccomplished ? 1.5 : 1}
                strokeDasharray={bothAccomplished ? "none" : "4 4"}
                opacity={bothAccomplished ? 0.8 : 0.5}
                className={bothAccomplished ? "data-flow" : ""}
              />
            );
          })}

          {/* Mission hex nodes */}
          {missions.map((mission, i) => {
            const pos = positions[i];
            const status = missionStates[mission.id] ?? "locked";
            const colors = MISSION_NODE_COLORS[status];
            const isInteractive = status !== "locked";
            const nodeR = 14;

            return (
              <g
                key={mission.id}
                className={isInteractive ? "cursor-pointer" : "cursor-not-allowed"}
                onClick={() => isInteractive && onMissionClick(mission.id)}
                style={{ transition: "transform 0.2s ease" }}
              >
                {/* Glow ring */}
                {colors.glow !== "none" && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeR + 6}
                    fill={colors.glow}
                    className={
                      status === "accomplished" ? "territory-pulse" :
                      status === "available" ? "available-pulse" :
                      status === "decaying" ? "decay-pulse" : ""
                    }
                  />
                )}

                {/* Progress ring for in-progress */}
                {status === "in-progress" && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeR + 3}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={1.5}
                    strokeDasharray="8 4"
                    opacity={0.6}
                    style={{
                      transformOrigin: `${pos.x}px ${pos.y}px`,
                      animation: "progressSpin 4s linear infinite",
                    }}
                  />
                )}

                {/* Hex node shape */}
                <polygon
                  points={hexPoints(pos.x, pos.y, nodeR)}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={status === "accomplished" ? 2 : 1.5}
                  opacity={status === "locked" ? 0.4 : 1}
                />

                {/* Inner content */}
                {status === "accomplished" && (
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    ✓
                  </text>
                )}
                {status === "in-progress" && (
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={colors.stroke}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    ▶
                  </text>
                )}
                {status === "decaying" && (
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={colors.stroke}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    !
                  </text>
                )}
                {(status === "locked" || status === "available") && (
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={colors.stroke}
                    fontSize="9"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="bold"
                    opacity={status === "locked" ? 0.4 : 0.9}
                  >
                    {i + 1}
                  </text>
                )}

                {/* Hover tooltip */}
                {isInteractive && (
                  <title>{`${mission.title} — ${statusLabel[status]}`}</title>
                )}
              </g>
            );
          })}
        </svg>

        {/* Progress bar at bottom */}
        {(enrolled || completedCount > 0) && (
          <div className="px-3 pb-2">
            <div className="flex gap-0.5">
              {missions.map((m, i) => {
                const status = missionStates[m.id] ?? "locked";
                return (
                  <div
                    key={i}
                    className="h-[3px] flex-1 rounded-full transition-colors duration-500"
                    style={{
                      background:
                        status === "accomplished"
                          ? "#06d6d6"
                          : status === "in-progress"
                          ? "rgba(6, 214, 214, 0.4)"
                          : status === "decaying"
                          ? "rgba(245, 158, 11, 0.4)"
                          : "rgba(30, 34, 51, 0.5)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate hex polygon points string
function hexPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // flat-top hex
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(" ");
}
