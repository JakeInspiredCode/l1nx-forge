"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ALL_CAMPAIGNS, getMissionsForCampaign, ALL_SECTORS } from "@/lib/seeds/campaigns";
import type { Sector, SectorProgress, MissionStatus } from "@/lib/types/campaign";
import StarfieldCanvas from "@/components/star-map/starfield-canvas";
import ScanOverlay from "@/components/ui/scan-overlay";
import GalaxyHeader from "./galaxy-header";
import SectorNode from "./sector-node";
import SectorTooltip from "./sector-tooltip";
import SectorOverlay from "./sector-overlay";
import StatsPanel from "./stats-panel";

export default function GalaxyMap() {
  const router = useRouter();
  const profile = useQuery(api.forgeProfile.get);
  const campaignStates = useQuery(api.forgeCampaigns.getAllCampaignStates);
  const missionStates = useQuery(api.forgeMissions.getAllMissionStates);
  const enrollCampaign = useMutation(api.forgeCampaigns.enrollCampaign);

  const [hoveredSector, setHoveredSector] = useState<Sector | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isLoading = !profile || !campaignStates || !missionStates;

  // Build mission status lookup
  const missionStatusMap: Record<string, MissionStatus> = useMemo(() => {
    const map: Record<string, MissionStatus> = {};
    if (missionStates) {
      for (const ms of missionStates) {
        map[ms.missionId] = ms.status as MissionStatus;
      }
    }
    return map;
  }, [missionStates]);

  // Compute sector progress
  const sectorProgressMap: Record<string, SectorProgress> = useMemo(() => {
    const map: Record<string, SectorProgress> = {};
    for (const sector of ALL_SECTORS) {
      let totalMissions = 0;
      let completedMissions = 0;
      let activeCampaignId: string | null = null;
      let hasVolunteered = false;

      for (const cid of sector.campaignIds) {
        const campaign = ALL_CAMPAIGNS.find((c) => c.id === cid);
        if (!campaign) continue;
        const missions = getMissionsForCampaign(cid);
        totalMissions += missions.length;

        const campaignState = campaignStates?.find((cs) => cs.campaignId === cid);
        if (campaignState?.enrolled) {
          hasVolunteered = true;
          activeCampaignId = cid;
        }

        for (const m of missions) {
          if (missionStatusMap[m.id] === "accomplished") {
            completedMissions++;
          }
        }
      }

      map[sector.id] = {
        sectorId: sector.id,
        totalMissions,
        completedMissions,
        activeCampaignId,
        hasVolunteered,
        isComplete: totalMissions > 0 && completedMissions === totalMissions,
      };
    }
    return map;
  }, [campaignStates, missionStatusMap]);

  // Derived stats
  const totalMissions = Object.values(sectorProgressMap).reduce((s, p) => s + p.totalMissions, 0);
  const totalAccomplished = Object.values(sectorProgressMap).reduce((s, p) => s + p.completedMissions, 0);
  const sectorsExplored = Object.values(sectorProgressMap).filter((p) => p.hasVolunteered).length;

  // Active campaign info for stats panel
  const enrolledState = campaignStates?.find((c) => c.enrolled);
  const activeCampaign = enrolledState
    ? ALL_CAMPAIGNS.find((c) => c.id === enrolledState.campaignId)
    : undefined;
  const activeCampaignMissions = activeCampaign
    ? getMissionsForCampaign(activeCampaign.id)
    : [];
  const activeCampaignCompleted = activeCampaignMissions.filter(
    (m) => missionStatusMap[m.id] === "accomplished"
  ).length;
  const activeCampaignPct = activeCampaignMissions.length > 0
    ? Math.round((activeCampaignCompleted / activeCampaignMissions.length) * 100)
    : undefined;

  const handleSectorHover = useCallback((sector: Sector | null) => {
    setHoveredSector(sector);
  }, []);

  const handleSectorClick = useCallback((sector: Sector) => {
    setSelectedSector(sector);
    setHoveredSector(null);
  }, []);

  const handleDismissOverlay = useCallback(() => {
    setSelectedSector(null);
  }, []);

  const handleVolunteer = useCallback(async (campaignId: string) => {
    await enrollCampaign({ campaignId });
  }, [enrollCampaign]);

  const handleEmbark = useCallback(() => {
    setSelectedSector(null);
    router.push("/missions");
  }, [router]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // Hyperspace lanes — connect sectors that share topic prerequisites or are thematically close
  const lanes: [Sector, Sector][] = useMemo(() => {
    const s = (id: string) => ALL_SECTORS.find((sec) => sec.id === id)!;
    return [
      [s("sector-linux"), s("sector-hardware")],
      [s("sector-linux"), s("sector-networking")],
      [s("sector-hardware"), s("sector-power")],
      [s("sector-networking"), s("sector-fiber")],
      [s("sector-networking"), s("sector-scale")],
      [s("sector-ops"), s("sector-linux")],
      [s("sector-ops"), s("sector-power")],
    ];
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Starfield background */}
      <StarfieldCanvas />
      <ScanOverlay />

      {/* Galaxy header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <GalaxyHeader
          totalXp={profile?.totalPoints ?? 0}
          streak={profile?.streak ?? 0}
          sectorsExplored={sectorsExplored}
          totalSectors={ALL_SECTORS.length}
        />
      </div>

      {/* Main layout: map + stats */}
      <div className="absolute inset-0 z-[5] flex pt-12">
        {/* Galaxy map SVG */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-v2-text-dim text-sm telemetry-font animate-pulse">
                Scanning galaxy sectors...
              </div>
            </div>
          ) : (
            <svg
              viewBox="0 0 1000 800"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              {/* Hyperspace lanes */}
              {lanes.map(([a, b], i) => (
                <line
                  key={i}
                  x1={a.mapPosition.x * 10}
                  y1={a.mapPosition.y * 8}
                  x2={b.mapPosition.x * 10}
                  y2={b.mapPosition.y * 8}
                  stroke="#7a8298"
                  strokeWidth={0.5}
                  strokeDasharray="4 8"
                  opacity={0.15}
                />
              ))}

              {/* Sector nodes */}
              {ALL_SECTORS.map((sector) => (
                <SectorNode
                  key={sector.id}
                  sector={{
                    ...sector,
                    mapPosition: {
                      x: sector.mapPosition.x,
                      y: sector.mapPosition.y * 0.8, // Scale Y to match viewBox aspect
                    },
                  }}
                  progress={sectorProgressMap[sector.id]}
                  onHover={handleSectorHover}
                  onClick={handleSectorClick}
                />
              ))}
            </svg>
          )}
        </div>

        {/* Stats panel */}
        <div className="w-[220px] shrink-0 border-l border-v2-border bg-v2-bg-surface/60 backdrop-blur-sm">
          <StatsPanel
            totalXp={profile?.totalPoints ?? 0}
            streak={profile?.streak ?? 0}
            sectorsExplored={sectorsExplored}
            totalSectors={ALL_SECTORS.length}
            missionsAccomplished={totalAccomplished}
            totalMissions={totalMissions}
            activeCampaignTitle={activeCampaign?.title}
            activeCampaignPct={activeCampaignPct}
          />
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredSector && !selectedSector && (
        <SectorTooltip
          sector={hoveredSector}
          progress={sectorProgressMap[hoveredSector.id]}
          mousePos={mousePos}
        />
      )}

      {/* Sector overlay */}
      {selectedSector && (
        <SectorOverlay
          sector={selectedSector}
          progress={sectorProgressMap[selectedSector.id]}
          missionStatuses={missionStatusMap}
          onVolunteer={handleVolunteer}
          onEmbark={handleEmbark}
          onDismiss={handleDismissOverlay}
        />
      )}
    </div>
  );
}
