"use client";

import type { BountyTemplate } from "@/lib/types/campaign";
import HexPanel from "@/components/ui/hex-panel";
import StatusBadge from "@/components/ui/status-badge";

interface BountyCardProps {
  bounty: BountyTemplate;
  onClick: (bountyId: string) => void;
}

const typeIcons: Record<string, string> = {
  "quick-draw": "⚡",
  "incident-drill": "🚨",
  diagnosis: "🔍",
  flashcards: "🃏",
  terminal: "💻",
};

const tierVariant = (tier: number) =>
  tier === 1 ? "cyan" : tier === 2 ? "blue" : tier === 3 ? "purple" : "muted";

export default function BountyCard({ bounty, onClick }: BountyCardProps) {
  return (
    <HexPanel
      size="sm"
      onClick={() => onClick(bounty.id)}
      className="hover:border-v2-cyan/40 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">
          {typeIcons[bounty.activityType] ?? "•"}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-v2-text truncate">
            {bounty.title}
          </h3>
          <p className="text-xs text-v2-text-dim line-clamp-1">
            {bounty.description}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <StatusBadge label={`T${bounty.tier}`} variant={tierVariant(bounty.tier) as any} />
            <StatusBadge label={`~${bounty.estimatedMinutes}m`} variant="muted" />
            <span className="text-xs mono text-v2-cyan">+{bounty.xpReward} XP</span>
          </div>
        </div>
      </div>
    </HexPanel>
  );
}
