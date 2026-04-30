"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Mission,
  MissionStatus,
  MissionStep,
} from "@/lib/types/campaign";
import { STEP_TYPE_ICONS } from "@/lib/constants/mission";
import ActionButton from "@/components/ui/action-button";
import StatusBadge from "@/components/ui/status-badge";

interface MissionPreviewPanelProps {
  mission: Mission;
  status: MissionStatus;
  missionNumber: number;
  totalMissions: number;
  campaignColor: string;
  enrolled: boolean;
  onDeploy: (missionId: string, loadout: MissionStep[]) => void;
  onSkipToCheck: (missionId: string) => void;
}

export default function MissionPreviewPanel({
  mission,
  status,
  missionNumber,
  totalMissions,
  campaignColor,
  enrolled,
  onDeploy,
  onSkipToCheck,
}: MissionPreviewPanelProps) {
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Reset overflow state when mission changes
  useEffect(() => {
    setOverflowOpen(false);
  }, [mission.id]);

  // Close overflow on outside click / Escape
  useEffect(() => {
    if (!overflowOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        overflowRef.current &&
        !overflowRef.current.contains(e.target as Node)
      ) {
        setOverflowOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverflowOpen(false);
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [overflowOpen]);

  const totalMinutes = mission.defaultLoadout.reduce(
    (sum, s) => sum + s.estimatedMinutes,
    0,
  );

  const isLocked = status === "locked";
  const isDeployable = !isLocked || enrolled;
  const isAccomplished = status === "accomplished";

  const handleDeploy = () => onDeploy(mission.id, mission.defaultLoadout);
  const handleSkip = () => {
    setOverflowOpen(false);
    onSkipToCheck(mission.id);
  };

  return (
    <div
      className="h-full p-3 flex flex-col animate-[holoMaterialize_0.18s_ease-out]"
      style={{ borderColor: `${campaignColor}30` }}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className="shrink-0 w-7 h-7 rounded flex items-center justify-center telemetry-font text-xs font-bold mt-0.5"
          style={{
            background: `${campaignColor}12`,
            border: `1px solid ${campaignColor}30`,
            color: campaignColor,
            textShadow: `0 0 8px ${campaignColor}40`,
          }}
        >
          {missionNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] telemetry-font text-[#8eafc8] uppercase tracking-wider">
              Mission {missionNumber} of {totalMissions}
            </span>
            {status === "decaying" && (
              <StatusBadge label="Needs review" variant="warning" />
            )}
            {isAccomplished && (
              <StatusBadge label="Accomplished" variant="cyan" />
            )}
            {isLocked && <StatusBadge label="Locked" variant="muted" />}
          </div>
          <h2
            className="display-font text-sm tracking-[0.12em] uppercase mt-0.5"
            style={{
              color: campaignColor,
              textShadow: `0 0 12px ${campaignColor}40`,
            }}
          >
            {mission.title}
          </h2>
        </div>
      </div>

      {/* PRIMARY ACTION — Deploy CTA at top */}
      <div className="mb-3">
        {!isDeployable ? (
          <div
            className="text-center py-2.5 rounded"
            style={{
              border: `1px dashed ${campaignColor}30`,
              background: `${campaignColor}06`,
            }}
          >
            <span className="text-[11px] telemetry-font text-[#8eafc8] uppercase tracking-wider">
              Enroll to deploy
            </span>
          </div>
        ) : (
          <div className="flex items-stretch gap-2">
            <ActionButton
              onClick={handleDeploy}
              variant={isAccomplished ? "secondary" : "primary"}
              size="lg"
              className="flex-1"
            >
              {isAccomplished ? "Review Mission" : "▶ Deploy Mission"}
            </ActionButton>
            <div className="relative" ref={overflowRef}>
              <button
                onClick={() => setOverflowOpen((v) => !v)}
                aria-label="More actions"
                className="h-full px-2.5 text-[#8eafc8] hover:text-[#e0e4ec] border border-v2-border hover:border-[#8eafc8]/40 rounded text-base leading-none transition-colors"
              >
                ⋯
              </button>
              {overflowOpen && !isAccomplished && (
                <div
                  className="absolute right-0 top-full mt-1 z-20 holo-panel min-w-[150px] p-1 animate-[holoMaterialize_0.18s_ease-out]"
                  style={{ borderColor: `${campaignColor}30` }}
                >
                  <button
                    onClick={handleSkip}
                    className="w-full text-left px-2 py-1.5 text-[11px] text-[#c8d6e5] hover:bg-v2-bg-elevated/60 rounded"
                  >
                    Skip to Check
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-[11px] text-[#c8d6e5] leading-snug mb-3">
        {mission.description}
      </p>

      {/* Loadout — read-only */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[10px] telemetry-font text-[#8eafc8] uppercase tracking-wider">
            Loadout
          </h3>
          <span className="text-[10px] telemetry-font text-[#8eafc8]">
            {mission.defaultLoadout.length} steps · ~{totalMinutes}m
          </span>
        </div>
        <div className="space-y-px">
          {mission.defaultLoadout.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-2 py-0.5 px-1 text-[11px]"
            >
              <span className="w-4 text-center text-[10px]">
                {STEP_TYPE_ICONS[step.type] ?? "•"}
              </span>
              <span className="text-[#c8d6e5] truncate flex-1">
                {step.label}
              </span>
              <span className="telemetry-font text-[10px] text-[#8eafc8]">
                {step.estimatedMinutes}m
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Check */}
      <div
        className="px-2 py-2 rounded"
        style={{
          background: `${campaignColor}08`,
          border: `1px solid ${campaignColor}12`,
        }}
      >
        <h3 className="text-[10px] telemetry-font text-[#8eafc8] uppercase tracking-wider mb-1">
          Knowledge Check
        </h3>
        <p className="text-[11px] text-[#c8d6e5] leading-snug">
          {mission.knowledgeCheck.description}
        </p>
        <span className="text-[9px] telemetry-font text-[#8eafc8]">
          Pass: {Math.round(mission.knowledgeCheck.passThreshold * 100)}%
        </span>
      </div>
    </div>
  );
}
