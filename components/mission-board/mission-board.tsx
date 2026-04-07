"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ALL_CAMPAIGNS, getMissionsForCampaign, ALL_BOUNTIES, getMission } from "@/lib/seeds/campaigns";
import type { MissionStatus } from "@/lib/types/campaign";
import HexPanel from "@/components/ui/hex-panel";
import GlowStat from "@/components/ui/glow-stat";
import ActionButton from "@/components/ui/action-button";
import StatusBadge from "@/components/ui/status-badge";
import TelemetryBar from "@/components/ui/telemetry-bar";
import BountyCard from "./bounty-card";
import ScanOverlay from "@/components/ui/scan-overlay";

export default function MissionBoard() {
  const router = useRouter();
  const profile = useQuery(api.forgeProfile.get);
  const campaignStates = useQuery(api.forgeCampaigns.getAllCampaignStates);
  const missionStates = useQuery(api.forgeMissions.getAllMissionStates);

  const isLoading = !profile || !campaignStates || !missionStates;

  // Find active campaign
  const enrolledState = campaignStates?.find((c) => c.enrolled);
  const activeCampaign = enrolledState
    ? ALL_CAMPAIGNS.find((c) => c.id === enrolledState.campaignId)
    : undefined;

  // Find next mission in active campaign
  const nextMission = activeCampaign && enrolledState
    ? getMission(activeCampaign.missions[enrolledState.currentMissionIndex])
    : undefined;

  // Find decaying missions
  const decayingMissions = missionStates?.filter(
    (m) => m.status === "decaying"
  ) ?? [];

  // Smart bounty selection: pick 4 varied bounties
  const recommendedBounties = ALL_BOUNTIES.slice(0, 4);

  // Today's XP (simplified — we'd compute from session data in production)
  const todayXp = 0;
  const weeklyMissions = missionStates?.filter(
    (m) => m.status === "accomplished"
  ).length ?? 0;

  const handleBountyClick = (bountyId: string) => {
    // Route to appropriate activity in Arsenal
    router.push(`/arsenal?bounty=${bountyId}`);
  };

  return (
    <div className="relative min-h-screen bg-v2-bg-deep">
      <ScanOverlay />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="display-font text-xl text-v2-cyan tracking-widest">
            Mission Board
          </h1>
          <div className="flex items-center gap-4">
            <GlowStat value={todayXp} label="Today" size="sm" />
            <GlowStat value={profile?.streak ?? 0} label="Streak" icon="🔥" size="sm" />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-v2-text-dim text-sm">Loading...</div>
        ) : (
          <>
            {/* 1. Active Campaign Mission */}
            {activeCampaign && nextMission && enrolledState && (
              <HexPanel glow>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-v2-text-muted uppercase tracking-wider">
                        {activeCampaign.title}
                      </p>
                      <h2 className="text-lg font-medium text-v2-text">
                        Next: {nextMission.title}
                      </h2>
                    </div>
                    <ActionButton
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/missions/${nextMission.id}`)}
                    >
                      Deploy
                    </ActionButton>
                  </div>
                  <TelemetryBar
                    value={
                      (enrolledState.completedMissions.length /
                        activeCampaign.missions.length) *
                      100
                    }
                    segments={activeCampaign.missions.length}
                    label={`Mission ${enrolledState.currentMissionIndex + 1} of ${activeCampaign.missions.length}`}
                  />
                </div>
              </HexPanel>
            )}

            {/* No campaign enrolled */}
            {!activeCampaign && (
              <HexPanel>
                <div className="text-center py-4">
                  <p className="text-sm text-v2-text-dim mb-3">
                    No active campaign. Enroll in one to get daily missions.
                  </p>
                  <ActionButton
                    variant="primary"
                    onClick={() => router.push("/")}
                  >
                    Browse Star Map
                  </ActionButton>
                </div>
              </HexPanel>
            )}

            {/* 2. Territory Defense */}
            {decayingMissions.length > 0 && (
              <div>
                <h2 className="text-xs text-v2-warning uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>!</span> Territory Defense — {decayingMissions.length} systems losing ground
                </h2>
                <div className="space-y-2">
                  {decayingMissions.slice(0, 3).map((ms) => {
                    const mData = getMission(ms.missionId);
                    return (
                      <HexPanel
                        key={ms.missionId}
                        size="sm"
                        glowColor="warning"
                        onClick={() => router.push(`/missions/${ms.missionId}`)}
                        className="cursor-pointer hover:border-v2-warning/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-v2-text">
                            {mData?.title ?? ms.missionId}
                          </span>
                          <StatusBadge label="Needs review" variant="warning" />
                        </div>
                      </HexPanel>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Bounty Board */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs text-v2-text-muted uppercase tracking-wider">
                  Bounty Board
                </h2>
                <button
                  onClick={() => router.push("/arsenal")}
                  className="text-xs text-v2-cyan hover:text-v2-cyan-bright transition-colors"
                >
                  View all →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recommendedBounties.map((bounty) => (
                  <BountyCard
                    key={bounty.id}
                    bounty={bounty}
                    onClick={handleBountyClick}
                  />
                ))}
              </div>
            </div>

            {/* 4. Stats bar */}
            <div className="flex items-center justify-center gap-8 pt-2">
              <GlowStat value={weeklyMissions} label="Missions this week" size="sm" />
              <GlowStat value={profile?.badges?.length ?? 0} label="Badges" size="sm" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
