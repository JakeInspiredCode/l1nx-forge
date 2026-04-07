"use client";

import type { Campaign, Mission, MissionStatus } from "@/lib/types/campaign";
import MissionNode from "./mission-node";
import TelemetryBar from "@/components/ui/telemetry-bar";
import StatusBadge from "@/components/ui/status-badge";

interface CampaignSectionProps {
  campaign: Campaign;
  missions: Mission[];
  missionStates: Record<string, MissionStatus>;
  completedCount: number;
  enrolled: boolean;
  onMissionClick: (missionId: string) => void;
  onEnroll: (campaignId: string) => void;
}

export default function CampaignSection({
  campaign,
  missions,
  missionStates,
  completedCount,
  enrolled,
  onMissionClick,
  onEnroll,
}: CampaignSectionProps) {
  const progress = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;
  const isComplete = completedCount === missions.length && missions.length > 0;

  return (
    <section className="relative">
      {/* Campaign header */}
      <div className="hex-panel p-4 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{campaign.icon}</span>
              <h2 className="display-font text-base text-v2-text tracking-wider truncate">
                {campaign.title}
              </h2>
            </div>
            <p className="text-xs text-v2-text-dim line-clamp-2">{campaign.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge
                label={`${missions.length} missions`}
                variant="muted"
              />
              <StatusBadge
                label={`~${campaign.estimatedDays}d`}
                variant="muted"
              />
              {isComplete && (
                <StatusBadge label="Complete" variant="success" />
              )}
            </div>
          </div>

          {!enrolled && !isComplete && (
            <button
              onClick={() => onEnroll(campaign.id)}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded bg-v2-cyan/15 text-v2-cyan border border-v2-cyan/40 hover:bg-v2-cyan/25 transition-colors v2-btn-glow"
            >
              Enroll
            </button>
          )}
        </div>

        {/* Progress bar */}
        {(enrolled || completedCount > 0) && (
          <TelemetryBar
            value={progress}
            segments={missions.length}
            label={`${completedCount} / ${missions.length} missions`}
            color={isComplete ? "success" : "cyan"}
            className="mt-3"
          />
        )}
      </div>

      {/* Mission nodes — vertical path */}
      <div className="relative ml-6 pl-6 border-l border-v2-border">
        {missions.map((mission, i) => {
          const status = missionStates[mission.id] ?? "locked";
          return (
            <div key={mission.id} className="relative pb-4 last:pb-0">
              {/* Connection dot on the border line */}
              <div
                className={`absolute -left-[7.5px] top-3 w-3 h-3 rounded-full border-2 ${
                  status === "accomplished"
                    ? "bg-v2-cyan border-v2-cyan"
                    : status === "in-progress"
                    ? "bg-v2-cyan-dim border-v2-cyan"
                    : status === "decaying"
                    ? "bg-v2-warning/30 border-v2-warning"
                    : status === "available"
                    ? "bg-v2-bg-surface border-v2-cyan/50"
                    : "bg-v2-bg-surface border-v2-border"
                }`}
              />
              <MissionNode
                id={mission.id}
                title={mission.title}
                index={i}
                status={status}
                onClick={onMissionClick}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
