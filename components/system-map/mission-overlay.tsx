"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Mission, MissionStatus, MissionStep } from "@/lib/types/campaign";
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
  onDeploy: (missionId: string, loadout: MissionStep[]) => void;
  onSkipToCheck: (missionId: string) => void;
  onDismiss: () => void;
}

export default function MissionOverlay({
  mission,
  status,
  missionNumber,
  totalMissions,
  campaignColor,
  onDeploy,
  onSkipToCheck,
  onDismiss,
}: MissionOverlayProps) {
  const sound = useSoundEngine();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // ── Loadout toggle state ──
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const step of mission.defaultLoadout) {
      map[step.id] = true;
    }
    return map;
  });

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

  // ── Mouse parallax ──
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

  // ── Escape to dismiss ──
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onDismiss]);

  // ── Actions ──
  const handleDeploy = useCallback(() => {
    sound.play("deploy");
    onDeploy(mission.id, activeSteps);
  }, [mission.id, activeSteps, onDeploy, sound]);

  const handleSkipToCheck = useCallback(() => {
    sound.play("deploy");
    onSkipToCheck(mission.id);
  }, [mission.id, onSkipToCheck, sound]);

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

            {/* Loadout with inline toggles */}
            <div className="mb-4">
              <h3 className="text-[9px] telemetry-font text-v2-text-muted uppercase tracking-wider mb-2">
                Mission Loadout
              </h3>
              <div className="space-y-1">
                {mission.defaultLoadout.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => toggle(step.id, step.required)}
                    className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-[11px] text-left transition-colors ${
                      enabled[step.id]
                        ? "bg-v2-bg-elevated/40"
                        : "opacity-40"
                    } ${step.required ? "cursor-default" : "cursor-pointer hover:bg-v2-bg-elevated/60"}`}
                  >
                    {/* Toggle indicator */}
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                        step.required
                          ? "border-v2-text-muted/40 bg-v2-cyan/10"
                          : enabled[step.id]
                          ? "border-v2-cyan/60 bg-v2-cyan/15"
                          : "border-v2-border"
                      }`}
                    >
                      {(enabled[step.id] || step.required) && (
                        <span className="text-v2-cyan text-[8px]">✓</span>
                      )}
                    </div>

                    <span className="text-[10px] w-4 text-center">
                      {STEP_TYPE_ICONS[step.type] ?? "•"}
                    </span>
                    <span className="text-v2-text-dim flex-1 truncate">{step.label}</span>
                    <span className="text-[9px] telemetry-font text-v2-text-muted">
                      {step.estimatedMinutes}m
                    </span>
                    {step.required && (
                      <span className="text-[8px] telemetry-font text-v2-text-muted opacity-50">
                        REQ
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="text-[9px] telemetry-font text-v2-text-muted mt-2">
                {activeSteps.length} steps · ~{totalMinutes} min
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
                    onClick={handleSkipToCheck}
                    variant="ghost"
                    size="sm"
                  >
                    Skip to Check
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
