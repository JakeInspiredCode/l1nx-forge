"use client";

import HexPanel from "@/components/ui/hex-panel";
import GlowStat from "@/components/ui/glow-stat";
import ActionButton from "@/components/ui/action-button";
import XpCounter from "./xp-counter";

interface BountyDebriefProps {
  bountyTitle: string;
  score: number;
  xpEarned: number;
  onClaimAnother: () => void;
  onReturn: () => void;
}

export default function BountyDebrief({
  bountyTitle,
  score,
  xpEarned,
  onClaimAnother,
  onReturn,
}: BountyDebriefProps) {
  return (
    <div className="fixed inset-0 bg-v2-bg-deep/80 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm accomplished-flash">
        <HexPanel glow glowColor="cyan">
          <div className="text-center py-4">
            <h2 className="display-font text-lg text-v2-cyan tracking-wider mb-1">
              Bounty Complete
            </h2>
            <p className="text-xs text-v2-text-dim mb-4">{bountyTitle}</p>

            <div className="flex items-center justify-center gap-6 mb-4">
              <GlowStat value={`${score}%`} label="Score" size="sm" />
              <div className="flex flex-col items-center">
                <XpCounter target={xpEarned} className="text-2xl" />
                <span className="text-[10px] text-v2-text-dim uppercase tracking-wider">XP</span>
              </div>
            </div>

            <div className="flex gap-2">
              <ActionButton variant="primary" size="sm" onClick={onClaimAnother} className="flex-1">
                Claim Another
              </ActionButton>
              <ActionButton variant="secondary" size="sm" onClick={onReturn} className="flex-1">
                Return
              </ActionButton>
            </div>
          </div>
        </HexPanel>
      </div>
    </div>
  );
}
