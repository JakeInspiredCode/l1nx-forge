"use client";

interface PathNode {
  missionId: string;
  cx: number;
  cy: number;
}

interface CampaignPathProps {
  nodes: PathNode[];
  currentMissionIndex: number;
  pathColor: string;
}

export default function CampaignPath({ nodes, currentMissionIndex, pathColor }: CampaignPathProps) {
  if (nodes.length < 2) return null;

  return (
    <g>
      {/* Path segments connecting sequential missions */}
      {nodes.map((node, i) => {
        if (i === 0) return null;
        const prev = nodes[i - 1];
        const isCompleted = i <= currentMissionIndex;

        return (
          <line
            key={`path-${prev.missionId}-${node.missionId}`}
            x1={prev.cx}
            y1={prev.cy}
            x2={node.cx}
            y2={node.cy}
            stroke={isCompleted ? pathColor : "#7a8298"}
            strokeWidth={isCompleted ? 1.5 : 0.8}
            strokeDasharray={isCompleted ? "none" : "4 6"}
            opacity={isCompleted ? 0.6 : 0.2}
            className={isCompleted ? "" : "animate-[dataFlow_1.5s_linear_infinite]"}
          />
        );
      })}

      {/* "You are here" pulse marker on current mission */}
      {currentMissionIndex >= 0 && currentMissionIndex < nodes.length && (
        <circle
          cx={nodes[currentMissionIndex].cx}
          cy={nodes[currentMissionIndex].cy}
          r={6}
          fill="none"
          stroke={pathColor}
          strokeWidth={1.5}
          opacity={0.8}
          className="animate-[availablePulse_2s_ease-in-out_infinite]"
        />
      )}
    </g>
  );
}
