"use client";

import HexPanel from "@/components/ui/hex-panel";
import GlowStat from "@/components/ui/glow-stat";
import ActionButton from "@/components/ui/action-button";
import XpCounter from "./xp-counter";

interface CampaignMilestoneProps {
  campaignTitle: string;
  missionsCompleted: number;
  totalMissions: number;
  xpBonus: number;
  onContinue: () => void;
}

export default function CampaignMilestone({
  campaignTitle,
  missionsCompleted,
  totalMissions,
  xpBonus,
  onContinue,
}: CampaignMilestoneProps) {
  return (
    <div className="fixed inset-0 bg-v2-bg-deep/90 z-50 flex items-center justify-center p-4">
      <div className="scan-lines absolute inset-0 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md accomplished-flash">
        <HexPanel glow glowColor="cyan" size="lg">
          <div className="text-center py-6">
            <p className="text-xs text-v2-text-muted uppercase tracking-wider mb-2">
              Campaign Milestone
            </p>
            <h2 className="display-font text-2xl glow-text-cyan tracking-wider mb-1">
              {missionsCompleted} Missions
            </h2>
            <p className="text-sm text-v2-text-dim mb-6">{campaignTitle}</p>

            <div className="flex items-center justify-center gap-8 mb-6">
              <GlowStat
                value={`${missionsCompleted}/${totalMissions}`}
                label="Progress"
                size="md"
              />
              <div className="flex flex-col items-center">
                <XpCounter target={xpBonus} className="text-3xl" prefix="+" />
                <span className="text-xs text-v2-text-dim uppercase tracking-wider">
                  Bonus XP
                </span>
              </div>
            </div>

            <ActionButton variant="primary" size="lg" onClick={onContinue} className="w-full">
              Continue
            </ActionButton>
          </div>
        </HexPanel>
      </div>
    </div>
  );
}
