"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Sector, SectorProgress, MissionStatus } from "@/lib/types/campaign";
import { getCampaign, getMissionsForCampaign } from "@/lib/seeds/campaigns";
import ActionButton from "@/components/ui/action-button";
import { useSoundEngine } from "@/lib/sound-engine";

interface SectorOverlayProps {
  sector: Sector;
  progress: SectorProgress;
  missionStatuses: Record<string, MissionStatus>;
  onVolunteer: (campaignId: string) => void;
  onEmbark: () => void;
  onDismiss: () => void;
}

export default function SectorOverlay({
  sector,
  progress,
  missionStatuses,
  onVolunteer,
  onEmbark,
  onDismiss,
}: SectorOverlayProps) {
  const sound = useSoundEngine();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const campaign = getCampaign(sector.campaignIds[0]);
  const missions = campaign ? getMissionsForCampaign(campaign.id) : [];

  const pct = progress.totalMissions > 0
    ? Math.round((progress.completedMissions / progress.totalMissions) * 100)
    : 0;

  // Parallax mouse tracking
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

  // Escape to close
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onDismiss]);

  const handleVolunteer = useCallback(() => {
    if (campaign) {
      sound.play("deploy");
      onVolunteer(campaign.id);
    }
  }, [campaign, onVolunteer, sound]);

  const handleEmbark = useCallback(() => {
    sound.play("deploy");
    onEmbark();
  }, [onEmbark, sound]);

  function getMissionStatusIcon(missionId: string): string {
    const status = missionStatuses[missionId];
    switch (status) {
      case "accomplished": return "✓";
      case "in-progress": return "▸";
      case "decaying": return "⟲";
      case "available": return "○";
      default: return "·";
    }
  }

  function getMissionStatusColor(missionId: string): string {
    const status = missionStatuses[missionId];
    switch (status) {
      case "accomplished": return "#22c55e";
      case "in-progress": return sector.color;
      case "decaying": return "#f59e0b";
      case "available": return "#7a8298";
      default: return "#444b5c";
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[64] bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed z-[65] inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="pointer-events-auto w-[420px] max-h-[85vh] overflow-auto scroll-container"
          style={{
            transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
          }}
        >
        <div
          className="holo-panel p-6 animate-[holoMaterialize_0.3s_ease-out]"
          style={{
            borderColor: `${sector.color}30`,
            boxShadow: `0 0 40px ${sector.color}15, inset 0 0 30px ${sector.color}05`,
          }}
        >
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 text-v2-text-muted hover:text-v2-text text-xs"
          >
            ✕
          </button>

          {/* Sector header */}
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{sector.icon}</span>
            <div>
              <h2
                className="display-font text-sm tracking-[0.15em] uppercase"
                style={{ color: sector.color, textShadow: `0 0 12px ${sector.color}40` }}
              >
                {sector.title}
              </h2>
              <span className="text-[9px] telemetry-font text-v2-text-muted uppercase tracking-wider">
                Sector
              </span>
            </div>
          </div>

          <p className="text-xs text-v2-text-dim leading-relaxed mb-4">
            {sector.description}
          </p>

          {/* Campaign section */}
          {campaign && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="display-font text-xs tracking-wider uppercase text-v2-text">
                  {campaign.title}
                </span>
              </div>

              {/* Campaign meta */}
              <div className="flex items-center gap-4 mb-3 text-[10px] telemetry-font text-v2-text-muted">
                <span>{missions.length} missions</span>
                <span>~{campaign.estimatedMinutes} min</span>
                <span>~{campaign.estimatedDays} days</span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-1.5 rounded-full bg-v2-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: progress.isComplete ? "#22c55e" : sector.color,
                    }}
                  />
                </div>
                <span className="text-[10px] telemetry-font" style={{ color: sector.color }}>
                  {pct}%
                </span>
              </div>

              {/* Mission list */}
              <div className="space-y-1 max-h-[200px] overflow-auto scroll-container pr-1">
                {missions.map((mission, i) => (
                  <div
                    key={mission.id}
                    className="flex items-center gap-2 py-1 px-2 rounded text-[11px]"
                    style={{
                      backgroundColor: missionStatuses[mission.id] === "in-progress"
                        ? `${sector.color}08`
                        : "transparent",
                    }}
                  >
                    <span
                      className="text-[10px] w-3 text-center"
                      style={{ color: getMissionStatusColor(mission.id) }}
                    >
                      {getMissionStatusIcon(mission.id)}
                    </span>
                    <span className="text-v2-text-dim telemetry-font text-[9px] w-4 text-right opacity-50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-v2-text-dim flex-1"
                      style={{
                        color: missionStatuses[mission.id] === "accomplished"
                          ? "#22c55e"
                          : missionStatuses[mission.id] === "in-progress"
                            ? sector.color
                            : undefined,
                      }}
                    >
                      {mission.title}
                    </span>
                    <span className="text-[9px] telemetry-font text-v2-text-muted">
                      {mission.estimatedMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-v2-border">
            {progress.isComplete ? (
              <div className="flex-1 text-center py-2">
                <span className="display-font text-xs tracking-wider text-green-400 uppercase">
                  Sector Secured ✓
                </span>
              </div>
            ) : !progress.hasVolunteered ? (
              <ActionButton
                onClick={handleVolunteer}
                className="flex-1"
              >
                Volunteer for Campaign
              </ActionButton>
            ) : (
              <ActionButton
                onClick={handleEmbark}
                className="flex-1"
              >
                Embark to System →
              </ActionButton>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
