"use client";

import type { MissionStatus } from "@/lib/types/campaign";
import { MISSION_NODE_COLORS } from "@/lib/design/forge-v2-tokens";

interface MissionNodeProps {
  id: string;
  title: string;
  index: number;
  status: MissionStatus;
  onClick: (id: string) => void;
}

const statusLabel: Record<MissionStatus, string> = {
  locked: "Locked",
  available: "Ready",
  "in-progress": "In Progress",
  accomplished: "Accomplished",
  decaying: "Needs Review",
};

export default function MissionNode({ id, title, index, status, onClick }: MissionNodeProps) {
  const colors = MISSION_NODE_COLORS[status];
  const isInteractive = status !== "locked";
  const nodeSize = 48;

  const pulseClass =
    status === "accomplished" ? "territory-pulse" :
    status === "available" ? "available-pulse" :
    status === "decaying" ? "decay-pulse" :
    "";

  return (
    <button
      onClick={() => isInteractive && onClick(id)}
      disabled={!isInteractive}
      className={`group relative flex items-center gap-4 w-full text-left transition-all duration-200 ${
        isInteractive ? "cursor-pointer" : "cursor-not-allowed opacity-60"
      }`}
      aria-label={`Mission ${index + 1}: ${title} — ${statusLabel[status]}`}
    >
      {/* Node circle */}
      <div className="relative flex-shrink-0">
        <svg width={nodeSize} height={nodeSize} viewBox={`0 0 ${nodeSize} ${nodeSize}`}>
          {/* Glow background */}
          {colors.glow !== "none" && (
            <circle
              cx={nodeSize / 2}
              cy={nodeSize / 2}
              r={nodeSize / 2 - 2}
              fill={colors.glow}
              className={pulseClass}
            />
          )}
          {/* Main circle */}
          <circle
            cx={nodeSize / 2}
            cy={nodeSize / 2}
            r={nodeSize / 2 - 6}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={2}
          />
          {/* Status indicator */}
          {status === "accomplished" && (
            <text
              x={nodeSize / 2}
              y={nodeSize / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize="16"
            >
              ✓
            </text>
          )}
          {status === "in-progress" && (
            <text
              x={nodeSize / 2}
              y={nodeSize / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colors.stroke}
              fontSize="14"
              fontFamily="monospace"
            >
              ▶
            </text>
          )}
          {status === "decaying" && (
            <text
              x={nodeSize / 2}
              y={nodeSize / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colors.stroke}
              fontSize="14"
            >
              !
            </text>
          )}
          {(status === "locked" || status === "available") && (
            <text
              x={nodeSize / 2}
              y={nodeSize / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colors.stroke}
              fontSize="12"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {index + 1}
            </text>
          )}
        </svg>
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${
          status === "accomplished" ? "text-v2-cyan" :
          status === "decaying" ? "text-v2-warning" :
          status === "locked" ? "text-v2-text-muted" :
          "text-v2-text"
        }`}>
          {title}
        </div>
        <div className={`text-xs ${
          status === "accomplished" ? "text-v2-cyan/60" :
          status === "decaying" ? "text-v2-warning/60" :
          "text-v2-text-muted"
        }`}>
          {statusLabel[status]}
        </div>
      </div>

      {/* Hover indicator */}
      {isInteractive && (
        <span className="text-v2-text-muted group-hover:text-v2-cyan transition-colors text-xs">
          →
        </span>
      )}
    </button>
  );
}
