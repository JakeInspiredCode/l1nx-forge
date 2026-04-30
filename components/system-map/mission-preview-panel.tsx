"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type {
  Mission,
  MissionStatus,
  MissionStep,
} from "@/lib/types/campaign";
import { STEP_TYPE_ICONS } from "@/lib/constants/mission";
import ActionButton from "@/components/ui/action-button";
import StatusBadge from "@/components/ui/status-badge";
import MissionLoadoutEditor from "./mission-loadout-editor";

interface MissionPreviewPanelProps {
  mission: Mission;
  status: MissionStatus;
  missionNumber: number;
  totalMissions: number;
  campaignColor: string;
  enrolled: boolean;
  pinned: boolean;
  onDeploy: (missionId: string, loadout: MissionStep[]) => void;
  onSkipToCheck: (missionId: string) => void;
  onUnpin: () => void;
}

export default function MissionPreviewPanel({
  mission,
  status,
  missionNumber,
  totalMissions,
  campaignColor,
  enrolled,
  pinned,
  onDeploy,
  onSkipToCheck,
  onUnpin,
}: MissionPreviewPanelProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const step of mission.defaultLoadout) {
      map[step.id] = true;
    }
    return map;
  });
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Reset toggles when the mission changes (panel is reused across missions)
  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const step of mission.defaultLoadout) {
      map[step.id] = true;
    }
    setEnabled(map);
    setCustomizeOpen(false);
    setOverflowOpen(false);
  }, [mission.id, mission.defaultLoadout]);

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

  // Escape unpins
  useEffect(() => {
    if (!pinned) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !overflowOpen) onUnpin();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pinned, overflowOpen, onUnpin]);

  const toggle = useCallback((stepId: string, required: boolean) => {
    if (required) return;
    setEnabled((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  }, []);

  const activeSteps = useMemo(
    () => mission.defaultLoadout.filter((s) => enabled[s.id]),
    [mission.defaultLoadout, enabled],
  );
  const totalMinutes = useMemo(
    () => activeSteps.reduce((sum, s) => sum + s.estimatedMinutes, 0),
    [activeSteps],
  );

  const isLocked = status === "locked";
  const isDeployable = !isLocked || enrolled;
  const isAccomplished = status === "accomplished";

  const handleDeploy = () => onDeploy(mission.id, activeSteps);
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
      <div className="flex items-start gap-2 mb-1">
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
          <span className="text-[10px] telemetry-font text-[#8eafc8] uppercase tracking-wider">
            Mission {missionNumber} of {totalMissions}
          </span>
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
        {pinned && (
          <button
            onClick={onUnpin}
            aria-label="Unpin mission"
            className="text-[#8eafc8] hover:text-[#e0e4ec] text-xs leading-none px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status badge */}
      {(status === "decaying" || isAccomplished || isLocked) && (
        <div className="mb-2">
          {status === "decaying" && (
            <StatusBadge label="Needs review" variant="warning" />
          )}
          {isAccomplished && (
            <StatusBadge label="Accomplished" variant="cyan" />
          )}
          {isLocked && <StatusBadge label="Locked" variant="muted" />}
        </div>
      )}

      {/* Description */}
      <p className="text-[11px] text-[#c8d6e5] leading-snug mb-3">
        {mission.description}
      </p>

      {/* Loadout */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[10px] telemetry-font text-[#8eafc8] uppercase tracking-wider">
            Loadout
          </h3>
          <span className="text-[10px] telemetry-font text-[#8eafc8]">
            {activeSteps.length} steps · ~{totalMinutes}m
          </span>
        </div>

        {customizeOpen ? (
          <MissionLoadoutEditor
            mission={mission}
            enabled={enabled}
            onToggle={toggle}
          />
        ) : (
          <div className="space-y-px mb-1.5">
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
        )}

        {!isAccomplished && isDeployable && (
          <button
            onClick={() => setCustomizeOpen((v) => !v)}
            className="text-[11px] telemetry-font hover:underline transition-colors mt-1"
            style={{ color: `${campaignColor}cc` }}
          >
            {customizeOpen ? "Hide customize ▴" : "Customize loadout ▾"}
          </button>
        )}
      </div>

      {/* Knowledge Check */}
      <div
        className="mb-3 px-2 py-2 rounded"
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

      {/* Spacer pushes actions to the bottom */}
      <div className="flex-1" />

      {/* Actions */}
      <div
        className="flex items-stretch gap-2 pt-2"
        style={{ borderTop: `1px solid ${campaignColor}15` }}
      >
        {!isDeployable ? (
          <div className="flex-1 text-center py-2">
            <span className="text-[11px] text-[#8eafc8]">
              Enroll in the campaign to deploy
            </span>
          </div>
        ) : isAccomplished ? (
          <ActionButton
            onClick={handleDeploy}
            variant="secondary"
            className="flex-1"
          >
            Review Mission
          </ActionButton>
        ) : (
          <>
            <ActionButton onClick={handleDeploy} className="flex-1">
              Deploy Mission
            </ActionButton>
            <div className="relative" ref={overflowRef}>
              <button
                onClick={() => setOverflowOpen((v) => !v)}
                aria-label="More actions"
                className="h-full px-2.5 text-[#8eafc8] hover:text-[#e0e4ec] border border-v2-border hover:border-[#8eafc8]/40 rounded text-base leading-none transition-colors"
              >
                ⋯
              </button>
              {overflowOpen && (
                <div
                  className="absolute right-0 bottom-full mb-1 z-20 holo-panel min-w-[150px] p-1 animate-[holoMaterialize_0.18s_ease-out]"
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
          </>
        )}
      </div>
    </div>
  );
}
