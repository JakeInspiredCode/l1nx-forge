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
  enrolled: boolean;
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
  enrolled,
  onDeploy,
  onSkipToCheck,
  onDismiss,
}: MissionOverlayProps) {
  const sound = useSoundEngine();
  const [isDeploying, setIsDeploying] = useState(false);

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
    if (isDeploying) return;
    sound.play("deploy");
    setIsDeploying(true);
    onDeploy(mission.id, activeSteps);
  }, [isDeploying, mission.id, activeSteps, onDeploy, sound]);

  const handleSkipToCheck = useCallback(() => {
    if (isDeploying) return;
    sound.play("deploy");
    setIsDeploying(true);
    onSkipToCheck(mission.id);
  }, [isDeploying, mission.id, onSkipToCheck, sound]);

  const isLocked = status === "locked";
  const isDeployable = !isLocked || enrolled;
  const isAccomplished = status === "accomplished";

  return (
    <>
      <div
        className="fixed inset-0 z-[64] bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      <div className="fixed z-[65] inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto w-[420px] max-h-[85vh] overflow-auto scroll-container">
          <div
            className="holo-panel p-6 animate-[holoMaterialize_0.18s_ease-out] relative"
            style={{
              borderColor: `${campaignColor}30`,
              boxShadow: `0 0 40px ${campaignColor}15, inset 0 0 30px ${campaignColor}05`,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-4 right-4 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${campaignColor}60, transparent)` }}
            />

            {/* Close */}
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 text-[#8eafc8] hover:text-v2-text text-xs transition-colors"
            >
              &#10005;
            </button>

            {/* Header with mission badge */}
            <div className="mb-1 flex items-start gap-3">
              {/* Mission number badge */}
              <div
                className="shrink-0 w-8 h-8 rounded flex items-center justify-center telemetry-font text-xs font-bold mt-0.5"
                style={{
                  background: `${campaignColor}12`,
                  border: `1px solid ${campaignColor}30`,
                  color: campaignColor,
                  textShadow: `0 0 8px ${campaignColor}40`,
                }}
              >
                {missionNumber}
              </div>
              <div>
                <span className="text-[9px] telemetry-font text-[#8eafc8] uppercase tracking-wider">
                  Mission {missionNumber}
                </span>
                <h2
                  className="display-font text-sm tracking-[0.12em] uppercase mt-1"
                  style={{ color: campaignColor, textShadow: `0 0 12px ${campaignColor}40` }}
                >
                  {mission.title}
                </h2>
              </div>
            </div>

            {/* Status badge */}
            <div className="mb-3">
              {isDecayingStatus(status) && <StatusBadge label="Needs review" variant="warning" />}
              {isAccomplished && <StatusBadge label="Accomplished" variant="cyan" />}
              {isLocked && <StatusBadge label="Locked" variant="muted" />}
            </div>

            <p className="text-xs text-[#c8d6e5] leading-relaxed mb-4">
              {mission.description}
            </p>

            {/* Section divider */}
            <div
              className="h-px mb-4"
              style={{ background: `linear-gradient(90deg, transparent, ${campaignColor}25, transparent)` }}
            />

            {/* Loadout with inline toggles */}
            <div className="mb-4">
              <h3 className="text-[9px] telemetry-font text-[#8eafc8] uppercase tracking-wider mb-2">
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
            <div className="mb-4 px-2.5 py-2.5 rounded" style={{ background: `${campaignColor}08`, border: `1px solid ${campaignColor}12` }}>
              <h3 className="text-[9px] telemetry-font text-[#8eafc8] uppercase tracking-wider mb-1">
                Knowledge Check
              </h3>
              <p className="text-[11px] text-[#c8d6e5]">{mission.knowledgeCheck.description}</p>
              <span className="text-[9px] telemetry-font text-[#8eafc8]">
                Pass: {Math.round(mission.knowledgeCheck.passThreshold * 100)}%
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3" style={{ borderTop: `1px solid ${campaignColor}15` }}>
              {!isDeployable ? (
                <div className="flex-1 text-center py-2">
                  <span className="text-[11px] text-v2-text-muted">
                    Enroll in the campaign to deploy
                  </span>
                </div>
              ) : isAccomplished ? (
                <ActionButton
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  variant="secondary"
                  className="flex-1"
                >
                  {isDeploying ? (
                    <>
                      <span className="embark-dot" />
                      <span className="embark-dot" style={{ animationDelay: "120ms" }} />
                      <span className="embark-dot" style={{ animationDelay: "240ms" }} />
                      <span className="ml-1">Loading</span>
                    </>
                  ) : (
                    <>Review Mission</>
                  )}
                </ActionButton>
              ) : (
                <>
                  <ActionButton onClick={handleDeploy} disabled={isDeploying} className="flex-1">
                    {isDeploying ? (
                      <>
                        <span className="embark-dot" />
                        <span className="embark-dot" style={{ animationDelay: "120ms" }} />
                        <span className="embark-dot" style={{ animationDelay: "240ms" }} />
                        <span className="ml-1">Deploying</span>
                      </>
                    ) : (
                      <>Deploy Mission</>
                    )}
                  </ActionButton>
                  <ActionButton
                    onClick={handleSkipToCheck}
                    variant="ghost"
                    size="sm"
                    disabled={isDeploying}
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
