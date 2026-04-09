"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@/lib/convex-shim";
import { api } from "@/convex/_generated/api";
import { ALL_CAMPAIGNS, getMissionsForCampaign } from "@/lib/seeds/campaigns";
import { getSectorForCampaign } from "@/lib/seeds/sectors";
import type { Mission, MissionStatus, MissionStep } from "@/lib/types/campaign";
import StarfieldCanvas from "@/components/star-map/starfield-canvas";
import ScanOverlay from "@/components/ui/scan-overlay";
import CentralStar from "./central-star";
import MissionNode from "./mission-node";
import CampaignPath from "./campaign-path";
import MissionOverlay from "./mission-overlay";
import StatsSidebar from "./stats-sidebar";
import BottomNav from "@/components/ui/bottom-nav";

// ── Orbital position computation ──

interface OrbitalPos {
  cx: number;
  cy: number;
  size: number;
  celestialType: "asteroid" | "moon" | "planet" | "station";
}

// Predefined planet profiles — each mission gets a unique look
const PLANET_PROFILES: { size: number; celestialType: OrbitalPos["celestialType"]; orbitMult: number }[] = [
  { size: 8,  celestialType: "asteroid", orbitMult: 0.28 },   // 1: small rocky
  { size: 11, celestialType: "moon",     orbitMult: 0.38 },   // 2: rocky world
  { size: 18, celestialType: "planet",   orbitMult: 0.48 },   // 3: terrestrial
  { size: 14, celestialType: "planet",   orbitMult: 0.56 },   // 4: mars-like
  { size: 10, celestialType: "asteroid", orbitMult: 0.63 },   // 5: asteroid belt
  { size: 24, celestialType: "station",  orbitMult: 0.72 },   // 6: gas giant w/ rings
  { size: 20, celestialType: "planet",   orbitMult: 0.80 },   // 7: neptune-like
  { size: 12, celestialType: "moon",     orbitMult: 0.86 },   // 8: ice world
  { size: 16, celestialType: "planet",   orbitMult: 0.91 },   // 9: outer planet
  { size: 9,  celestialType: "asteroid", orbitMult: 0.95 },   // 10: kuiper object
  { size: 13, celestialType: "moon",     orbitMult: 0.98 },   // 11: dwarf planet
  { size: 22, celestialType: "station",  orbitMult: 1.0 },    // 12: outer station
];

function computeOrbitalPositions(count: number): OrbitalPos[] {
  const centerX = 500;
  const centerY = 400;
  const minRadius = 70;
  const maxRadius = 360;

  const positions: OrbitalPos[] = [];

  for (let i = 0; i < count; i++) {
    const profile = PLANET_PROFILES[i % PLANET_PROFILES.length];
    const orbitRadius = minRadius + profile.orbitMult * (maxRadius - minRadius);

    // Spread planets around the full orbit with golden-angle spacing
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
    const angle = i * goldenAngle + Math.PI * 0.75; // start at ~5 o'clock

    const cx = centerX + Math.cos(angle) * orbitRadius;
    const cy = centerY + Math.sin(angle) * orbitRadius;

    positions.push({
      cx,
      cy,
      size: profile.size,
      celestialType: profile.celestialType,
    });
  }

  return positions;
}

// ── Effective mission status ──

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

  const handleDeploy = useCallback((missionId: string, loadout: MissionStep[]) => {
    setSelectedMission(null);
    sessionStorage.setItem(
      `loadout:${missionId}`,
      JSON.stringify(loadout.map((s) => s.id)),
    );
    router.push(`/missions/${missionId}?autostart=true`);
  }, [router]);

  const handleSkipToCheck = useCallback((missionId: string) => {
    setSelectedMission(null);
    router.push(`/missions/${missionId}?skipToCheck=true`);
  }, [router]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const hasNoCampaign = !isLoading && !activeCampaign;

  return (
    <div className="h-screen w-screen relative overflow-hidden" onMouseMove={handleMouseMove}>
      <StarfieldCanvas />
      <ScanOverlay />

      {/* Cockpit viewport vignette */}
      <div className="viewport-vignette fixed inset-0 z-[8] pointer-events-none" />

      {/* HUD Stats bar at top */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] telemetry-font text-v2-text-muted uppercase">XP:</span>
          <span className="text-xs telemetry-font text-v2-cyan font-semibold">
            {(profile?.totalPoints ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] telemetry-font text-v2-text-muted uppercase">Streak:</span>
          <span className="text-xs telemetry-font text-v2-amber font-semibold">
            {profile?.streak ?? 0} d
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] telemetry-font text-v2-text-muted uppercase">Missions:</span>
          <span className="text-xs telemetry-font text-v2-text font-semibold">
            {completedCount} / {missions.length}
          </span>
        </div>
      </div>

      {/* Metallic title */}
      <div className="absolute top-8 left-0 right-0 z-10 text-center pointer-events-none">
        <h1 className="metallic-title text-xl md:text-2xl">
          {activeCampaign ? `Campaign: ${activeCampaign.title.replace(/^Operation\s+/, '')}` : 'Campaign View'}
        </h1>
      </div>

      {/* Main layout: map + sidebar */}
      <div className="absolute inset-0 z-[5] flex pt-16 pb-14">
        {/* Solar system SVG — main area */}
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

        {/* Stats sidebar — now on the right, framed */}
        <div className="w-[240px] shrink-0 flex flex-col mr-2 mb-1">
          <div className="panel-header-bar rounded-t shrink-0">
            <span>Mission Briefing</span>
          </div>
          <div className="flex-1 metallic-frame rounded-b bg-v2-bg-surface/60 backdrop-blur-sm overflow-hidden">
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
        </div>
      </div>

      {/* Bottom navigation bar */}
      <BottomNav activePage="missions" />

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
          onSkipToCheck={handleSkipToCheck}
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
