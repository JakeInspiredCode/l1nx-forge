// ── Core Types ──

export type TopicId =
  | "linux"
  | "hardware"
  | "fiber"
  | "power-cooling"
  | "networking"
  | "ops-processes"
  | "xai-context"
  | "behavioral";

export type CardType = "easy" | "intermediate" | "scenario";
export type Difficulty = 1 | 2 | 3;
export type Tier = 1 | 2 | 3 | 4;
export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface ForgeCard {
  id: string;
  topicId: TopicId;
  type: CardType;
  front: string;
  back: string;
  difficulty: Difficulty;
  tier: Tier;
  steps?: string[];
  // SM-2
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string;
  lastReview: string | null;
}

export interface ForgeReview {
  cardId: string;
  timestamp: string;
  quality: Quality;
  responseTime: number;
}

export interface ForgeSession {
  id: string;
  type: "mock-interview" | "daily-training" | "topic-drill";
  startTime: string;
  endTime: string | null;
  cardIds: string[];
  answers: SessionAnswer[];
  overallScore: number | null;
}

export interface SessionAnswer {
  cardId: string;
  transcript: string;
  rubricScores: { technical: number; structure: number; ownership: number };
  missedTerms: string[];
}

export interface TopicProgress {
  topicId: TopicId;
  masteryPercent: number;
  currentTier: Tier;
  tierProgress: Record<string, { total: number; qualified: number }>;
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  newCards: number;
  weakFlag: boolean;
  lastUpdated: string;
}

export interface ForgeProfile {
  streak: number;
  lastSessionDate: string;
  totalPoints: number;
  badges: string[];
  totalSessionMinutes: number;
}

export interface TopicMeta {
  id: TopicId;
  name: string;
  description: string;
  priority: number;
  icon: string;
}

export const TOPICS: TopicMeta[] = [
  { id: "linux", name: "Linux Administration", description: "CLI, systemd, logs, filesystems, permissions", priority: 1, icon: ">" },
  { id: "hardware", name: "Server Hardware", description: "GPUs, CPUs, memory, storage, BIOS/UEFI", priority: 2, icon: "#" },
  { id: "networking", name: "Networking", description: "TCP/IP, DNS, switching, routing, load balancing", priority: 3, icon: "~" },
  { id: "fiber", name: "Fiber & Cabling", description: "Fiber optics, transceivers, cable management", priority: 4, icon: "|" },
  { id: "power-cooling", name: "Power & Cooling", description: "PDUs, UPS, HVAC, thermal management", priority: 5, icon: "^" },
  { id: "ops-processes", name: "Ops & Processes", description: "Incident response, change management, monitoring", priority: 6, icon: "!" },
  { id: "xai-context", name: "xAI & Colossus", description: "Colossus architecture, xAI mission, scale context", priority: 7, icon: "*" },
  { id: "behavioral", name: "Behavioral", description: "STAR stories, leadership, teamwork, conflict", priority: 8, icon: "@" },
];

export const BADGE_DEFS = [
  { id: "first-forge", name: "First Forge", condition: "First session completed", icon: "anvil" },
  { id: "streak-3", name: "Streak 3", condition: "3 consecutive days", icon: "flame-silver" },
  { id: "streak-7", name: "Streak 7", condition: "Full week streak", icon: "flame-gold" },
  { id: "linux-lord", name: "Linux Lord", condition: "Linux mastery >= 90%", icon: "terminal" },
  { id: "scenario-slayer", name: "Scenario Slayer", condition: "50 scenario cards completed", icon: "crosshair" },
  { id: "mock-master", name: "Mock Master", condition: "5 mock interviews completed", icon: "signal" },
  { id: "colossus-ready", name: "Colossus Ready", condition: "Overall mastery >= 90%", icon: "star" },
  { id: "speed-demon", name: "Speed Demon", condition: "60-min session in under 45 min", icon: "bolt" },
  { id: "tier-breaker", name: "Tier Breaker", condition: "First Tier 4 unlock", icon: "chain" },
];
