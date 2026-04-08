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

  const enrolledState = campaignStates?.find((c) => c.enrolled);
  const activeCampaign = enrolledState
    ? ALL_CAMPAIGNS.find((c) => c.id === enrolledState.campaignId)
    : undefined;

  const nextMission = activeCampaign && enrolledState
    ? getMission(activeCampaign.missions[enrolledState.currentMissionIndex])
    : undefined;

  const decayingMissions = missionStates?.filter((m) => m.status === "decaying") ?? [];
  const recommendedBounties = ALL_BOUNTIES.slice(0, 4);

  const todayXp = 0;
  const weeklyMissions = missionStates?.filter((m) => m.status === "accomplished").length ?? 0;

  const handleBountyClick = (bountyId: string) => {
    router.push(`/arsenal?bounty=${bountyId}`);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <ScanOverlay />
      <div className="relative z-10 h-full flex">
        {/* Left panel — active campaign (40%) */}
        <div className="w-[40%] h-full border-r border-v2-border p-6 flex flex-col">
          <h1
            className="display-font text-xl tracking-[0.15em] mb-6"
            style={{
              color: "#f59e0b",
              textShadow: "0 0 12px rgba(245, 158, 11, 0.3)",
            }}
          >
            Mission Board
          </h1>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="telemetry-font text-v2-text-dim animate-pulse">Loading...</span>
            </div>
          ) : activeCampaign && nextMission && enrolledState ? (
            <div className="flex-1 flex flex-col justify-center">
              <HexPanel glow>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] telemetry-font tracking-widest uppercase text-v2-text-muted">
                      {activeCampaign.title}
                    </p>
                    <h2 className="text-lg font-medium text-v2-text mt-1">
                      Next: {nextMission.title}
                    </h2>
                  </div>
                  <TelemetryBar
                    value={(enrolledState.completedMissions.length / activeCampaign.missions.length) * 100}
                    segments={activeCampaign.missions.length}
                    label={`Mission ${enrolledState.currentMissionIndex + 1} of ${activeCampaign.missions.length}`}
                    color="warning"
                  />
                  <ActionButton
                    variant="primary"
                    onClick={() => router.push(`/missions/${nextMission.id}`)}
                    className="w-full"
                  >
                    Deploy
                  </ActionButton>
                </div>
              </HexPanel>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <HexPanel className="text-center">
                <p className="text-sm text-v2-text-dim mb-3">
                  No active campaign. Enroll from the Star Map.
                </p>
                <ActionButton variant="primary" onClick={() => router.push("/")}>
                  Browse Star Map
                </ActionButton>
              </HexPanel>
            </div>
          )}

          {/* Stats strip */}
          <div className="flex items-center justify-center gap-8 pt-4 border-t border-v2-border mt-4">
            <GlowStat value={todayXp} label="Today XP" size="sm" />
            <GlowStat value={profile?.streak ?? 0} label="Streak" size="sm" />
          </div>
        </div>

        {/* Right panel — territory defense + bounties (60%) */}
        <div className="flex-1 h-full p-6 overflow-auto scroll-container">
          {/* Territory Defense */}
          {decayingMissions.length > 0 && (
            <div className="mb-6">
              <h2
                className="text-[11px] tracking-widest uppercase mb-3 flex items-center gap-1.5"
                style={{
                  color: "#f59e0b",
                  fontFamily: "'Chakra Petch', sans-serif",
                }}
              >
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

          {/* Bounty Board */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-[11px] tracking-widest uppercase"
                style={{
                  color: "#f59e0b",
                  fontFamily: "'Chakra Petch', sans-serif",
                  opacity: 0.7,
                }}
              >
                Bounty Board
              </h2>
              <button
                onClick={() => router.push("/arsenal")}
                className="text-[11px] text-v2-amber hover:text-v2-amber-bright transition-colors tracking-wider"
                style={{ fontFamily: "'Chakra Petch', sans-serif" }}
              >
                View all →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendedBounties.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} onClick={handleBountyClick} />
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-v2-border">
            <GlowStat value={weeklyMissions} label="Missions this week" size="sm" />
            <GlowStat value={profile?.badges?.length ?? 0} label="Badges" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
