import { getMission, getCampaign } from "@/lib/seeds/campaigns";

interface CardDueInfo {
  topicId: string;
  tier: number;
  dueDate: string;
}

interface MissionStateInfo {
  missionId: string;
  status: string;
}

const DECAY_THRESHOLD_DAYS = 7;
const DECAY_CARD_PERCENT = 0.3;

/**
 * Compute which accomplished missions should flip to "decaying"
 * based on overdue cards for that mission's topic+tier.
 */
export function computeDecayingMissions(
  cards: CardDueInfo[],
  missionStates: MissionStateInfo[]
): string[] {
  const today = new Date().toISOString().split("T")[0];
  const thresholdDate = new Date(
    Date.now() - DECAY_THRESHOLD_DAYS * 86400000
  ).toISOString().split("T")[0];

  const decaying: string[] = [];

  for (const ms of missionStates) {
    if (ms.status !== "accomplished") continue;

    const mission = getMission(ms.missionId);
    if (!mission) continue;

    const campaign = getCampaign(mission.campaignId);
    if (!campaign) continue;

    const topicId = campaign.topicId;
    const tier = campaign.tier;

    // Find cards for this topic+tier
    const topicCards = cards.filter(
      (c) => c.topicId === topicId && c.tier === tier
    );

    if (topicCards.length === 0) continue;

    // Count significantly overdue cards (due before threshold date)
    const overdueCount = topicCards.filter(
      (c) => c.dueDate < thresholdDate
    ).length;

    const overduePercent = overdueCount / topicCards.length;

    if (overduePercent >= DECAY_CARD_PERCENT) {
      decaying.push(ms.missionId);
    }
  }

  return decaying;
}
