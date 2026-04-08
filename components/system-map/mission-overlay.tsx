"use client";

import { useCallback, useEffect, useState } from "react";
import type { Mission, MissionStatus } from "@/lib/types/campaign";
import { STEP_TYPE_ICONS } from "@/lib/constants/mission";
import ActionButton from "@/components/ui/action-button";
import StatusBadge from "@/components/ui/status-badge";
import { useSoundEngine } from "@/lib/sound-engine";

interface MissionOverlayProps {
  mission: Mission;
  status: MissionStatus;
  missionNumber: number;
  totalMissions: number;
  campaignColor: string;
  onDeploy: (missionId: string) => void;
  onCustomize: (missionId: string) => void;
  onDismiss: () => void;
}

export default function MissionOverlay({
  mission,
  status,
  missionNumber,
  totalMissions,
  campaignColor,
  onDeploy,
  onCustomize,
  onDismiss,
}: MissionOverlayProps) {
  const sound = useSoundEngine();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMouseOffset({
        x: (e.clientX - cx) * 0.006,
        y: (e.clientY - cy) * 0.006,
      });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onDismiss]);

  const handleDeploy = useCallback(() => {
    sound.play("deploy");
    onDeploy(mission.id);
  }, [mission.id, onDeploy, sound]);

  const handleCustomize = useCallback(() => {
    sound.play("deploy");
    onCustomize(mission.id);
  }, [mission.id, onCustomize, sound]);

  const isDeployable = status === "available" || status === "in-progress" || status === "decaying";
  const isLocked = status === "locked";
  const isAccomplished = status === "accomplished";

  return (
    <>
      <div
        className="fixed inset-0 z-[64] bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      <div className="fixed z-[65] inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="pointer-events-auto w-[420px] max-h-[85vh] overflow-auto scroll-container"
          style={{ transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)` }}
        >
          <div
            className="holo-panel p-6 animate-[holoMaterialize_0.3s_ease-out]"
            style={{
              borderColor: `${campaignColor}30`,
              boxShadow: `0 0 40px ${campaignColor}15, inset 0 0 30px ${campaignColor}05`,
            }}
          >
            {/* Close */}
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 text-v2-text-muted hover:text-v2-text text-xs"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-1">
              <span className="text-[9px] telemetry-font text-v2-text-muted uppercase tracking-wider">
                Mission {missionNumber} of {totalMissions}
              </span>
              <h2
                className="display-font text-sm tracking-[0.12em] uppercase mt-1"
                style={{ color: campaignColor, textShadow: `0 0 12px ${campaignColor}40` }}
              >
                {mission.title}
              </h2>
            </div>

            {/* Status badge */}
            <div className="mb-3">
              {isDecayingStatus(status) && <StatusBadge label="Needs review" variant="warning" />}
              {isAccomplished && <StatusBadge label="Accomplished" variant="cyan" />}
              {isLocked && <StatusBadge label="Locked" variant="muted" />}
            </div>

            <p className="text-xs text-v2-text-dim leading-relaxed mb-4">
              {mission.description}
            </p>

            {/* Estimated time */}
            <div className="text-[10px] telemetry-font text-v2-text-muted mb-4">
              Estimated: {mission.estimatedMinutes} min
            </div>

            {/* Loadout */}
            <div className="mb-4">
              <h3 className="text-[9px] telemetry-font text-v2-text-muted uppercase tracking-wider mb-2">
                Mission Loadout
              </h3>
              <div className="space-y-1">
                {mission.defaultLoadout.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-2 py-1 px-2 rounded text-[11px]"
                  >
                    <span className="text-[10px] w-4 text-center">
                      {STEP_TYPE_ICONS[step.type] ?? "•"}
                    </span>
                    <span className="text-v2-text-dim flex-1">{step.label}</span>
                    <span className="text-[9px] telemetry-font text-v2-text-muted">
                      {step.estimatedMinutes}m
                    </span>
                    {step.required && (
                      <span className="text-[8px] telemetry-font text-v2-text-muted opacity-50">
                        REQ
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge Check */}
            <div className="mb-4 px-2 py-2 bg-v2-bg-elevated/50 rounded">
              <h3 className="text-[9px] telemetry-font text-v2-text-muted uppercase tracking-wider mb-1">
                Knowledge Check
              </h3>
              <p className="text-[11px] text-v2-text-dim">{mission.knowledgeCheck.description}</p>
              <span className="text-[9px] telemetry-font text-v2-text-muted">
                Pass: {Math.round(mission.knowledgeCheck.passThreshold * 100)}%
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-v2-border">
              {isLocked ? (
                <div className="flex-1 text-center py-2">
                  <span className="text-[11px] text-v2-text-muted">
                    Complete the previous mission to unlock
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
                  <ActionButton
                    onClick={handleCustomize}
                    variant="secondary"
                    className="flex-1"
                  >
                    Customize Loadout
                  </ActionButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function isDecayingStatus(status: MissionStatus): boolean {
  return status === "decaying";
}
