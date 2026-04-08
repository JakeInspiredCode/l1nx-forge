"use client";

import { useRouter } from "next/navigation";
import type { Campaign, MissionStatus } from "@/lib/types/campaign";
import { getMission, ALL_BOUNTIES } from "@/lib/seeds/campaigns";
import GlowStat from "@/components/ui/glow-stat";
import HexPanel from "@/components/ui/hex-panel";
import ActionButton from "@/components/ui/action-button";
import StatusBadge from "@/components/ui/status-badge";
import TelemetryBar from "@/components/ui/telemetry-bar";
import BountyCard from "@/components/mission-board/bounty-card";

interface StatsSidebarProps {
  campaign: Campaign | undefined;
  completedCount: number;
  totalMissions: number;
  currentMissionIndex: number;
  totalXp: number;
  streak: number;
  decayingMissionIds: string[];
  hasNoCampaign: boolean;
}

export default function StatsSidebar({
  campaign,
  completedCount,
  totalMissions,
  currentMissionIndex,
  totalXp,
  streak,
  decayingMissionIds,
  hasNoCampaign,
}: StatsSidebarProps) {
  const router = useRouter();
  const recommendedBounties = ALL_BOUNTIES.slice(0, 3);

  const handleBountyClick = (bountyId: string) => {
    router.push(`/arsenal?bounty=${bountyId}`);
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-auto scroll-container">
      {/* Header */}
      <h1
        className="display-font text-[11px] tracking-[0.2em] uppercase mb-4"
        style={{
          color: "var(--room-accent)",
          textShadow: "0 0 8px var(--room-accent-glow)",
        }}
      >
        System Map
      </h1>

      {hasNoCampaign ? (
        <div className="flex-1 flex items-center justify-center">
          <HexPanel className="text-center">
            <p className="text-xs text-v2-text-dim mb-3">
              No active campaign. Volunteer from the Galaxy Map.
            </p>
            <ActionButton variant="primary" size="sm" onClick={() => router.push("/")}>
              Galaxy Map
            </ActionButton>
          </HexPanel>
        </div>
      ) : (
        <>
          {/* Campaign progress */}
          {campaign && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{campaign.icon}</span>
                <span className="text-[10px] display-font tracking-wider uppercase text-v2-text">
                  {campaign.title}
                </span>
              </div>
              <TelemetryBar
                value={totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0}
                segments={totalMissions}
                label={`Mission ${currentMissionIndex + 1} of ${totalMissions}`}
                color="warning"
              />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <GlowStat label="XP" value={totalXp.toLocaleString()} size="sm" />
            <GlowStat label="Streak" value={`${streak}d`} size="sm" />
          </div>

          {/* Territory Defense */}
          {decayingMissionIds.length > 0 && (
            <div className="mb-4">
              <h2
                className="text-[9px] tracking-widest uppercase mb-2 flex items-center gap-1"
                style={{ color: "#f59e0b", fontFamily: "'Chakra Petch', sans-serif" }}
              >
                ⚠ Territory Defense
              </h2>
              <div className="space-y-1.5">
                {decayingMissionIds.slice(0, 3).map((mid) => {
                  const m = getMission(mid);
                  return (
                    <HexPanel
                      key={mid}
                      size="sm"
                      glowColor="warning"
                      onClick={() => router.push(`/missions/${mid}`)}
                      className="cursor-pointer hover:border-v2-warning/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-v2-text truncate">
                          {m?.title ?? mid}
                        </span>
                        <StatusBadge label="Review" variant="warning" />
                      </div>
                    </HexPanel>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Bounty Dock — pinned to bottom */}
      <div className="mt-auto pt-3 border-t border-v2-border">
        <div className="flex items-center justify-between mb-2">
          <h2
            className="text-[9px] tracking-widest uppercase"
            style={{ color: "#f59e0b", fontFamily: "'Chakra Petch', sans-serif", opacity: 0.7 }}
          >
            Bounty Board
          </h2>
          <button
            onClick={() => router.push("/arsenal")}
            className="text-[9px] text-v2-amber hover:text-v2-amber-bright transition-colors tracking-wider"
            style={{ fontFamily: "'Chakra Petch', sans-serif" }}
          >
            View all →
          </button>
        </div>
        <div className="space-y-2">
          {recommendedBounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} onClick={handleBountyClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
