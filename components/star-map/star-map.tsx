"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@/lib/convex-shim";
import { api } from "@/convex/_generated/api";
import { ALL_CAMPAIGNS, ALL_MISSIONS, getMissionsForCampaign, getMission } from "@/lib/seeds/campaigns";
import type { Mission, MissionStatus } from "@/lib/types/campaign";
import StarfieldCanvas from "./starfield-canvas";
import MapHeader from "./map-header";
import ConstellationCluster from "./constellation-cluster";
import HoloBriefing from "./holo-briefing";
import ScanOverlay from "@/components/ui/scan-overlay";

import type { Doc, CampaignProgressFields, MissionProgressFields, ProfileFields } from "@/lib/data/schema";

export default function StarMap() {
  const router = useRouter();
  const profile = useQuery<Doc<ProfileFields> | null>(api.forgeProfile.get);
  const campaignStates = useQuery<Doc<CampaignProgressFields>[]>(api.forgeCampaigns.getAllCampaignStates);
  const missionStates = useQuery<Doc<MissionProgressFields>[]>(api.forgeMissions.getAllMissionStates);
  const enrollCampaign = useMutation(api.forgeCampaigns.enrollCampaign);

  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Build mission status lookup
  const missionStatusMap: Record<string, MissionStatus> = {};
  if (missionStates) {
    for (const ms of missionStates) {
      missionStatusMap[ms.missionId] = ms.status as MissionStatus;
    }
  }

  const accomplishedCount = missionStates
    ? missionStates.filter((m) => m.status === "accomplished").length
    : 0;

  const enrolledCampaigns = campaignStates?.filter((c) => c.enrolled) ?? [];
  const activeCampaignState = enrolledCampaigns[0];
  const activeCampaign = activeCampaignState
    ? ALL_CAMPAIGNS.find((c) => c.id === activeCampaignState.campaignId)
    : undefined;

  function getEffectiveStatus(missionId: string, campaignId: string, missionIndex: number): MissionStatus {
    if (missionStatusMap[missionId]) return missionStatusMap[missionId];
    const campaignState = campaignStates?.find((c) => c.campaignId === campaignId);
    if (!campaignState?.enrolled) return "locked";
    if (missionIndex === 0) return "available";
    const campaignMissions = getMissionsForCampaign(campaignId);
    const prevMission = campaignMissions[missionIndex - 1];
    if (prevMission && missionStatusMap[prevMission.id] === "accomplished") return "available";
    return "locked";
  }

  const handleMissionClick = useCallback((missionId: string, campaignId: string) => {
    const mission = getMission(missionId);
    if (mission) {
      setSelectedMission(mission);
      setSelectedCampaignId(campaignId);
    }
  }, []);

  const handleDismissBriefing = useCallback(() => {
    setSelectedMission(null);
    setSelectedCampaignId(null);
  }, []);

  const handleDeploy = useCallback((missionId: string) => {
    setSelectedMission(null);
    router.push(`/missions/${missionId}`);
  }, [router]);

  const handleEnroll = async (campaignId: string) => {
    await enrollCampaign({ campaignId });
  };

  const isLoading = !profile || !campaignStates || !missionStates;

  // Find which campaign the selected mission belongs to
  const selectedCampaign = selectedCampaignId
    ? ALL_CAMPAIGNS.find((c) => c.id === selectedCampaignId)
    : null;
  const selectedMissionIndex = selectedMission && selectedCampaign
    ? selectedCampaign.missions.indexOf(selectedMission.id) + 1
    : 0;

  return (
    <div className="h-[calc(100vh-48px)] w-full relative overflow-hidden">
      {/* Living starfield background */}
      <StarfieldCanvas />

      {/* Scan line atmosphere */}
      <ScanOverlay />

      {/* HUD header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 pt-4">
        <MapHeader
          totalXp={profile?.totalPoints ?? 0}
          streak={profile?.streak ?? 0}
          missionsAccomplished={accomplishedCount}
          totalMissions={ALL_MISSIONS.length}
          activeCampaign={activeCampaign?.title}
        />
      </div>

      {/* Campaign constellations */}
      <div className="absolute inset-0 z-[5] overflow-auto scroll-container pt-24 pb-32 px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-v2-text-dim text-sm telemetry-font animate-pulse">
              Scanning star systems...
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
            {ALL_CAMPAIGNS.map((campaign) => {
              const missions = getMissionsForCampaign(campaign.id);
              const campaignState = campaignStates?.find((c) => c.campaignId === campaign.id);
              const completedCount = campaignState?.completedMissions.length ?? 0;

              const effectiveStatuses: Record<string, MissionStatus> = {};
              missions.forEach((m, i) => {
                effectiveStatuses[m.id] = getEffectiveStatus(m.id, campaign.id, i);
              });

              return (
                <ConstellationCluster
                  key={campaign.id}
                  campaign={campaign}
                  missions={missions}
                  missionStates={effectiveStatuses}
                  completedCount={completedCount}
                  enrolled={campaignState?.enrolled ?? false}
                  onMissionClick={(missionId) => handleMissionClick(missionId, campaign.id)}
                  onEnroll={handleEnroll}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Holographic briefing overlay */}
      {selectedMission && selectedCampaign && (
        <HoloBriefing
          mission={selectedMission}
          campaignTitle={selectedCampaign.title}
          missionNumber={selectedMissionIndex}
          totalMissions={selectedCampaign.missions.length}
          status={missionStatusMap[selectedMission.id] ?? "available"}
          onDeploy={handleDeploy}
          onDismiss={handleDismissBriefing}
        />
      )}
    </div>
  );
}
