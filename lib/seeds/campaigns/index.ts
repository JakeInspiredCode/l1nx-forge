import { ALL_LINUX_CAMPAIGNS, ALL_LINUX_MISSIONS } from "./linux-campaign";
import { ALL_DC_CAMPAIGNS, ALL_DC_MISSIONS } from "./dc-fundamentals";
import { BOUNTY_TEMPLATES } from "../bounties";
export { ALL_SECTORS, getSector, getSectorForCampaign, getSectorByTopic } from "../sectors";

export const ALL_CAMPAIGNS = [...ALL_LINUX_CAMPAIGNS, ...ALL_DC_CAMPAIGNS];
export const ALL_MISSIONS = [...ALL_LINUX_MISSIONS, ...ALL_DC_MISSIONS];
export const ALL_BOUNTIES = BOUNTY_TEMPLATES;

// Lookup helpers
export function getCampaign(id: string) {
  return ALL_CAMPAIGNS.find((c) => c.id === id);
}

export function getMission(id: string) {
  return ALL_MISSIONS.find((m) => m.id === id);
}

export function getMissionsForCampaign(campaignId: string) {
  return ALL_MISSIONS.filter((m) => m.campaignId === campaignId);
}

export function getBounty(id: string) {
  return ALL_BOUNTIES.find((b) => b.id === id);
}

export function getBountiesByTopic(topicId: string) {
  return ALL_BOUNTIES.filter((b) => b.topicId === topicId);
}

export function getBountiesByType(activityType: string) {
  return ALL_BOUNTIES.filter((b) => b.activityType === activityType);
}
