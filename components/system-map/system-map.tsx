"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ALL_CAMPAIGNS, getMissionsForCampaign } from "@/lib/seeds/campaigns";
import { getSectorForCampaign } from "@/lib/seeds/sectors";
import type { Mission, MissionStatus } from "@/lib/types/campaign";
import StarfieldCanvas from "@/components/star-map/starfield-canvas";
import ScanOverlay from "@/components/ui/scan-overlay";
import CentralStar from "./central-star";
import MissionNode from "./mission-node";
import CampaignPath from "./campaign-path";
import MissionOverlay from "./mission-overlay";
import StatsSidebar from "./stats-sidebar";

// ── Orbital position computation ──

interface OrbitalPos {
  cx: number;
  cy: number;
  size: number;
  celestialType: "asteroid" | "moon" | "planet" | "station";
}

function computeOrbitalPositions(count: number): OrbitalPos[] {
  const centerX = 500;
  const centerY = 400;
  const minRadius = 80;
  const maxRadius = 340;

  const positions: OrbitalPos[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const orbitRadius = minRadius + t * (maxRadius - minRadius);

    // Spiral from ~7 o'clock to ~1 o'clock (clockwise arc)
    const angleStart = Math.PI * 0.6; // 7 o'clock
    const angleEnd = -Math.PI * 0.4;  // 1 o'clock
    const angle = angleStart + t * (angleEnd - angleStart);

    const cx = centerX + Math.cos(angle) * orbitRadius;
    const cy = centerY + Math.sin(angle) * orbitRadius;

    const baseSize = 10;
    const maxSize = 24;
    const size = baseSize + t * (maxSize - baseSize);

    let celestialType: OrbitalPos["celestialType"];
    if (t < 0.2) celestialType = "asteroid";
    else if (t < 0.5) celestialType = "moon";
    else if (t < 0.8) celestialType = "planet";
    else celestialType = "station";

    positions.push({ cx, cy, size, celestialType });
  }

  return positions;
}

// ── Effective mission status (same logic as galaxy-map) ──

function getEffectiveStatus(
  missionId: string,
  missionIndex: number,
  missionStatusMap: Record<string, MissionStatus>,
  enrolled: boolean,
  campaignMissions: Mission[],
): MissionStatus {
  if (missionStatusMap[missionId]) return missionStatusMap[missionId];
  if (!enrolled) return "locked";
  if (missionIndex === 0) return "available";
  const prev = campaignMissions[missionIndex - 1];
  if (prev && missionStatusMap[prev.id] === "accomplished") return "available";
  return "locked";
}

// ── Component ──

export default function SystemMap() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignIdParam = searchParams.get("campaign");

  const profile = useQuery(api.forgeProfile.get);
  const campaignStates = useQuery(api.forgeCampaigns.getAllCampaignStates);
  const missionStates = useQuery(api.forgeMissions.getAllMissionStates);

  const [hoveredMission, setHoveredMission] = useState<Mission | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isLoading = !profile || !campaignStates || !missionStates;

  // Resolve active campaign
  const activeCampaignId = campaignIdParam
    ?? campaignStates?.find((c) => c.enrolled)?.campaignId;
  const activeCampaign = activeCampaignId
    ? ALL_CAMPAIGNS.find((c) => c.id === activeCampaignId)
    : undefined;
  const enrolledState = campaignStates?.find((c) => c.campaignId === activeCampaignId);

  // Campaign sector for theming
  const sector = activeCampaignId ? getSectorForCampaign(activeCampaignId) : undefined;
  const campaignColor = sector?.color ?? "#f59e0b";

  // Missions for this campaign
  const missions = activeCampaign ? getMissionsForCampaign(activeCampaign.id) : [];

  // Mission status lookup
  const missionStatusMap: Record<string, MissionStatus> = useMemo(() => {
    const map: Record<string, MissionStatus> = {};
    if (missionStates) {
      for (const ms of missionStates) {
        map[ms.missionId] = ms.status as MissionStatus;
      }
    }
    return map;
  }, [missionStates]);

  // Effective statuses
  const effectiveStatuses: Record<string, MissionStatus> = useMemo(() => {
    const map: Record<string, MissionStatus> = {};
    const enrolled = enrolledState?.enrolled ?? false;
    missions.forEach((m, i) => {
      map[m.id] = getEffectiveStatus(m.id, i, missionStatusMap, enrolled, missions);
    });
    return map;
  }, [missions, missionStatusMap, enrolledState]);

  // Orbital positions
  const orbitalPositions = useMemo(() => computeOrbitalPositions(missions.length), [missions.length]);

  // Current mission index
  const currentMissionIndex = enrolledState?.currentMissionIndex ?? 0;
  const completedCount = enrolledState?.completedMissions.length ?? 0;

  // Decaying missions
  const decayingMissionIds = missionStates
    ?.filter((m) => m.status === "decaying" && missions.some((cm) => cm.id === m.missionId))
    .map((m) => m.missionId) ?? [];

  // Path nodes for campaign path
  const pathNodes = missions.map((m, i) => ({
    missionId: m.id,
    cx: orbitalPositions[i]?.cx ?? 500,
    cy: orbitalPositions[i]?.cy ?? 400,
  }));

  // Selected mission number
  const selectedMissionNumber = selectedMission
    ? missions.findIndex((m) => m.id === selectedMission.id) + 1
    : 0;

  const handleMissionHover = useCallback((mission: Mission | null) => {
    setHoveredMission(mission);
  }, []);

  const handleMissionClick = useCallback((mission: Mission) => {
    setSelectedMission(mission);
    setHoveredMission(null);
  }, []);

  const handleDismissOverlay = useCallback(() => {
    setSelectedMission(null);
  }, []);

  const handleDeploy = useCallback((missionId: string) => {
    setSelectedMission(null);
    router.push(`/missions/${missionId}`);
  }, [router]);

  const handleCustomize = useCallback((missionId: string) => {
    setSelectedMission(null);
    router.push(`/missions/${missionId}?customize=true`);
  }, [router]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const hasNoCampaign = !isLoading && !activeCampaign;

  return (
    <div className="h-screen w-screen relative overflow-hidden" onMouseMove={handleMouseMove}>
      <StarfieldCanvas />
      <ScanOverlay />

      <div className="absolute inset-0 z-[5] flex">
        {/* Stats sidebar */}
        <div className="w-[220px] shrink-0 border-r border-v2-border bg-v2-bg-surface/60 backdrop-blur-sm">
          <StatsSidebar
            campaign={activeCampaign}
            completedCount={completedCount}
            totalMissions={missions.length}
            currentMissionIndex={currentMissionIndex}
            totalXp={profile?.totalPoints ?? 0}
            streak={profile?.streak ?? 0}
            decayingMissionIds={decayingMissionIds}
            hasNoCampaign={hasNoCampaign}
          />
        </div>

        {/* Solar system SVG */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-v2-text-dim text-sm telemetry-font animate-pulse">
                Scanning star system...
              </div>
            </div>
          ) : hasNoCampaign ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-v2-text-muted text-sm telemetry-font">
                No system selected
              </div>
            </div>
          ) : (
            <svg
              viewBox="0 0 1000 800"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              {/* Campaign path (behind nodes) */}
              <CampaignPath
                nodes={pathNodes}
                currentMissionIndex={currentMissionIndex}
                pathColor={campaignColor}
              />

              {/* Central star */}
              <CentralStar
                cx={500}
                cy={400}
                icon={activeCampaign?.icon ?? "⭐"}
                title={activeCampaign?.title ?? ""}
                color={campaignColor}
              />

              {/* Mission nodes */}
              {missions.map((mission, i) => {
                const pos = orbitalPositions[i];
                if (!pos) return null;
                return (
                  <MissionNode
                    key={mission.id}
                    mission={mission}
                    status={effectiveStatuses[mission.id] ?? "locked"}
                    cx={pos.cx}
                    cy={pos.cy}
                    size={pos.size}
                    celestialType={pos.celestialType}
                    isCurrent={i === currentMissionIndex}
                    onHover={handleMissionHover}
                    onClick={handleMissionClick}
                  />
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredMission && !selectedMission && (
        <MissionTooltip
          mission={hoveredMission}
          status={effectiveStatuses[hoveredMission.id] ?? "locked"}
          mousePos={mousePos}
          campaignColor={campaignColor}
        />
      )}

      {/* Mission overlay */}
      {selectedMission && (
        <MissionOverlay
          mission={selectedMission}
          status={effectiveStatuses[selectedMission.id] ?? "locked"}
          missionNumber={selectedMissionNumber}
          totalMissions={missions.length}
          campaignColor={campaignColor}
          onDeploy={handleDeploy}
          onCustomize={handleCustomize}
          onDismiss={handleDismissOverlay}
        />
      )}
    </div>
  );
}

// ── Inline tooltip component ──

function MissionTooltip({
  mission,
  status,
  mousePos,
  campaignColor,
}: {
  mission: Mission;
  status: MissionStatus;
  mousePos: { x: number; y: number };
  campaignColor: string;
}) {
  const statusLabel: Record<MissionStatus, string> = {
    locked: "Locked",
    available: "Available",
    "in-progress": "In Progress",
    accomplished: "Accomplished",
    decaying: "Needs Review",
  };

  return (
    <div
      className="fixed z-[70] pointer-events-none"
      style={{ left: mousePos.x + 16, top: mousePos.y - 8 }}
    >
      <div
        className="hex-panel px-3 py-2 min-w-[160px]"
        style={{ borderColor: `${campaignColor}40`, boxShadow: `0 0 12px ${campaignColor}10` }}
      >
        <div
          className="display-font text-[10px] tracking-wider uppercase mb-0.5"
          style={{ color: campaignColor }}
        >
          {mission.title}
        </div>
        <div className="text-[9px] telemetry-font text-v2-text-muted">
          {statusLabel[status]} · {mission.estimatedMinutes}m
        </div>
      </div>
    </div>
  );
}
