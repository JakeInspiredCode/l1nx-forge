"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ALL_CAMPAIGNS, ALL_MISSIONS, getMissionsForCampaign } from "@/lib/seeds/campaigns";
import type { MissionStatus } from "@/lib/types/campaign";
import MapHeader from "./map-header";
import CampaignSection from "./campaign-section";
import ScanOverlay from "@/components/ui/scan-overlay";

export default function StarMap() {
  const router = useRouter();
  const profile = useQuery(api.forgeProfile.get);
  const campaignStates = useQuery(api.forgeCampaigns.getAllCampaignStates);
  const missionStates = useQuery(api.forgeMissions.getAllMissionStates);
  const enrollCampaign = useMutation(api.forgeCampaigns.enrollCampaign);

  // Build mission status lookup
  const missionStatusMap: Record<string, MissionStatus> = {};
  if (missionStates) {
    for (const ms of missionStates) {
      missionStatusMap[ms.missionId] = ms.status as MissionStatus;
    }
  }

  // Calculate global stats
  const accomplishedCount = missionStates
    ? missionStates.filter((m) => m.status === "accomplished").length
    : 0;

  // Find active campaign
  const enrolledCampaigns = campaignStates?.filter((c) => c.enrolled) ?? [];
  const activeCampaignState = enrolledCampaigns[0];
  const activeCampaign = activeCampaignState
    ? ALL_CAMPAIGNS.find((c) => c.id === activeCampaignState.campaignId)
    : undefined;

  // Derive mission availability for campaigns where no state exists yet
  function getEffectiveStatus(missionId: string, campaignId: string, missionIndex: number): MissionStatus {
    if (missionStatusMap[missionId]) return missionStatusMap[missionId];

    const campaignState = campaignStates?.find((c) => c.campaignId === campaignId);
    if (!campaignState?.enrolled) return "locked";

    // First uncompleted mission in enrolled campaign is available
    if (missionIndex === 0) return "available";

    const campaignMissions = getMissionsForCampaign(campaignId);
    const prevMission = campaignMissions[missionIndex - 1];
    if (prevMission && missionStatusMap[prevMission.id] === "accomplished") {
      return "available";
    }

    return "locked";
  }

  const handleMissionClick = (missionId: string) => {
    router.push(`/missions/${missionId}`);
  };

  const handleEnroll = async (campaignId: string) => {
    await enrollCampaign({ campaignId });
    // Initialize first mission as available
    const missions = getMissionsForCampaign(campaignId);
    if (missions.length > 0) {
      const initMission = (await import("@/convex/_generated/api")).api.forgeMissions.initMissionState;
      // We'll use the mutation directly from the hook
    }
  };

  const isLoading = !profile || !campaignStates || !missionStates;

  return (
    <div className="relative min-h-screen bg-v2-bg-deep">
      <ScanOverlay />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        <MapHeader
          totalXp={profile?.totalPoints ?? 0}
          streak={profile?.streak ?? 0}
          missionsAccomplished={accomplishedCount}
          totalMissions={ALL_MISSIONS.length}
          activeCampaign={activeCampaign?.title}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-v2-text-dim text-sm">Loading star map...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {ALL_CAMPAIGNS.map((campaign) => {
              const missions = getMissionsForCampaign(campaign.id);
              const campaignState = campaignStates?.find(
                (c) => c.campaignId === campaign.id
              );
              const completedCount = campaignState?.completedMissions.length ?? 0;

              // Build effective status map for this campaign
              const effectiveStatuses: Record<string, MissionStatus> = {};
              missions.forEach((m, i) => {
                effectiveStatuses[m.id] = getEffectiveStatus(m.id, campaign.id, i);
              });

              return (
                <CampaignSection
                  key={campaign.id}
                  campaign={campaign}
                  missions={missions}
                  missionStates={effectiveStatuses}
                  completedCount={completedCount}
                  enrolled={campaignState?.enrolled ?? false}
                  onMissionClick={handleMissionClick}
                  onEnroll={handleEnroll}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
