import type { Campaign, Mission } from "@/lib/types/campaign";

// ═══════════════════════════════════════════════════════════════════════════════
// DC Fundamentals — Short campaigns for non-Linux topics (Tier 1)
// These reference existing Tier 1 cards from Phase 1.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Operation Rack & Stack (Hardware) ──

export const HARDWARE_CAMPAIGN: Campaign = {
  id: "hardware-core",
  title: "Operation Rack & Stack",
  description: "Data center hardware fundamentals — GPUs, CPUs, memory, storage, BIOS/UEFI, and rack infrastructure.",
  topicId: "hardware",
  tier: 1,
  missions: ["hw-m01", "hw-m02", "hw-m03", "hw-m04"],
  estimatedDays: 5,
  estimatedMinutes: 100,
  icon: "🖥️",
  color: "#f59e0b",
};

// ── Operation Net Sweep (Networking) ──

export const NETWORKING_CAMPAIGN: Campaign = {
  id: "networking-core",
  title: "Operation Net Sweep",
  description: "Networking essentials — TCP/IP, DNS, switching, routing, load balancing, and troubleshooting.",
  topicId: "networking",
  tier: 1,
  missions: ["net-m01", "net-m02", "net-m03", "net-m04"],
  estimatedDays: 5,
  estimatedMinutes: 100,
  icon: "🌐",
  color: "#3b82f6",
};

// ── Operation Light Path (Fiber) ──

export const FIBER_CAMPAIGN: Campaign = {
  id: "fiber-core",
  title: "Operation Light Path",
  description: "Fiber optics — transceivers, cable types, connectors, cleaning, and cable management.",
  topicId: "fiber",
  tier: 1,
  missions: ["fib-m01", "fib-m02", "fib-m03"],
  estimatedDays: 4,
  estimatedMinutes: 75,
  icon: "💡",
  color: "#8b5cf6",
};

// ── Operation Power Grid (Power & Cooling) ──

export const POWER_CAMPAIGN: Campaign = {
  id: "power-core",
  title: "Operation Power Grid",
  description: "Power and cooling — PDUs, UPS systems, HVAC, thermal management, and redundancy.",
  topicId: "power-cooling",
  tier: 1,
  missions: ["pwr-m01", "pwr-m02", "pwr-m03"],
  estimatedDays: 4,
  estimatedMinutes: 75,
  icon: "⚡",
  color: "#ef4444",
};

// ── Operation Run Book (Ops & Processes) ──

export const OPS_CAMPAIGN: Campaign = {
  id: "ops-core",
  title: "Operation Run Book",
  description: "Operational processes — incident response, change management, monitoring, and escalation procedures.",
  topicId: "ops-processes",
  tier: 1,
  missions: ["ops-m01", "ops-m02", "ops-m03", "ops-m04"],
  estimatedDays: 5,
  estimatedMinutes: 100,
  icon: "📋",
  color: "#22c55e",
};

// ── Operation Horizon (Scale & Architecture) ──

export const SCALE_CAMPAIGN: Campaign = {
  id: "scale-core",
  title: "Operation Horizon",
  description: "Hyperscale architecture — rack density, cluster hierarchy, colo vs hyperscale, capacity planning.",
  topicId: "scale",
  tier: 1,
  missions: ["scl-m01", "scl-m02", "scl-m03"],
  estimatedDays: 4,
  estimatedMinutes: 75,
  icon: "🏗️",
  color: "#06b6d4",
};

// ── Mission stubs (Tier 1 only — content from existing cards) ──

function stubMission(id: string, campaignId: string, title: string, description: string, y: number, connections: string[]): Mission {
  return {
    id,
    campaignId,
    title,
    description,
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: `${id}-s1`,
        type: "flashcards",
        label: `Review: ${title}`,
        description: `Flashcards covering ${title.toLowerCase()}`,
        estimatedMinutes: 10,
        required: true,
        contentRef: { kind: "card-set", id: `${campaignId}-${id}`, params: { topicId: campaignId.replace("-core", ""), tier: 1, count: 8 } },
      },
    ],
    knowledgeCheck: {
      type: "card-quiz",
      description: "Answer 4 of 5 correctly",
      passThreshold: 0.8,
      items: [],
    },
    mapPosition: { x: 50, y },
    connections,
  };
}

export const DC_MISSIONS: Mission[] = [
  // Hardware
  stubMission("hw-m01", "hardware-core", "Server Anatomy", "Identify components in a server chassis", 0, ["hw-m02"]),
  stubMission("hw-m02", "hardware-core", "GPUs & Accelerators", "GPU types, PCIe lanes, power requirements", 1, ["hw-m01", "hw-m03"]),
  stubMission("hw-m03", "hardware-core", "Memory & Storage", "DIMM types, NVMe, SAS, SATA, SMART monitoring", 2, ["hw-m02", "hw-m04"]),
  stubMission("hw-m04", "hardware-core", "BIOS & Firmware", "UEFI, POST, BMC, IPMI, firmware updates", 3, ["hw-m03"]),

  // Networking
  stubMission("net-m01", "networking-core", "OSI & TCP/IP", "Network layers, protocols, encapsulation", 0, ["net-m02"]),
  stubMission("net-m02", "networking-core", "Switching & VLANs", "L2 concepts, MAC tables, trunking", 1, ["net-m01", "net-m03"]),
  stubMission("net-m03", "networking-core", "IP & Routing", "Subnetting, routing tables, default gateway", 2, ["net-m02", "net-m04"]),
  stubMission("net-m04", "networking-core", "DNS & Load Balancing", "Name resolution, record types, L4/L7 LB", 3, ["net-m03"]),

  // Fiber
  stubMission("fib-m01", "fiber-core", "Fiber Fundamentals", "Single-mode vs multi-mode, wavelengths", 0, ["fib-m02"]),
  stubMission("fib-m02", "fiber-core", "Transceivers & Connectors", "SFP+, QSFP, LC, MPO connectors", 1, ["fib-m01", "fib-m03"]),
  stubMission("fib-m03", "fiber-core", "Cable Management", "Patching, cleaning, testing, documentation", 2, ["fib-m02"]),

  // Power & Cooling
  stubMission("pwr-m01", "power-core", "Power Distribution", "PDUs, circuits, redundancy, metering", 0, ["pwr-m02"]),
  stubMission("pwr-m02", "power-core", "UPS & Backup", "UPS types, battery runtime, transfer switches", 1, ["pwr-m01", "pwr-m03"]),
  stubMission("pwr-m03", "power-core", "Cooling Systems", "CRAC, hot/cold aisle, liquid cooling, PUE", 2, ["pwr-m02"]),

  // Ops
  stubMission("ops-m01", "ops-core", "Incident Response", "Severity levels, escalation, communication", 0, ["ops-m02"]),
  stubMission("ops-m02", "ops-core", "Change Management", "CAB, maintenance windows, rollback plans", 1, ["ops-m01", "ops-m03"]),
  stubMission("ops-m03", "ops-core", "Monitoring & Alerting", "Metrics, thresholds, dashboards, on-call", 2, ["ops-m02", "ops-m04"]),
  stubMission("ops-m04", "ops-core", "Documentation & Runbooks", "SOPs, knowledge base, post-mortems", 3, ["ops-m03"]),

  // Scale
  stubMission("scl-m01", "scale-core", "Datacenter Tiers", "Tier I-IV, redundancy, SLAs", 0, ["scl-m02"]),
  stubMission("scl-m02", "scale-core", "Rack & Cluster Design", "U-space, power density, cabling standards", 1, ["scl-m01", "scl-m03"]),
  stubMission("scl-m03", "scale-core", "Hyperscale vs Colo", "Scale differences, automation, custom hardware", 2, ["scl-m02"]),
];

export const ALL_DC_CAMPAIGNS = [
  HARDWARE_CAMPAIGN,
  NETWORKING_CAMPAIGN,
  FIBER_CAMPAIGN,
  POWER_CAMPAIGN,
  OPS_CAMPAIGN,
  SCALE_CAMPAIGN,
];

export const ALL_DC_MISSIONS = DC_MISSIONS;
