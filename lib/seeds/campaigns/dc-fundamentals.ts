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

// ── Full Hardware missions (hw-m01..hw-m04) ──
// 2 readings (chapter-section) + 1 curated flashcards step + 8–10 MCQs, mirrors Linux Core shape.

const HARDWARE_MISSIONS: Mission[] = [
  {
    id: "hw-m01",
    campaignId: "hardware-core",
    title: "Server Anatomy",
    description: "What lives inside a rack-mount server, how the pieces fit, and why redundancy is baked into every layer.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "hw-m01-s1",
        type: "reading",
        label: "Read: Inside the Chassis",
        description: "CPUs, DIMMs, drives, NICs, PSUs, the BMC — and why servers aren't just big desktops",
        estimatedMinutes: 10,
        required: true,
        contentRef: { kind: "chapter-section", id: "hw-s1" },
      },
      {
        id: "hw-m01-s2",
        type: "reading",
        label: "Read: Redundancy & Failure Modes",
        description: "What fails first, hot-swap vs cold-swap, redundant PSUs, the RMA process",
        estimatedMinutes: 8,
        required: true,
        contentRef: { kind: "chapter-section", id: "hw-s2" },
      },
      {
        id: "hw-m01-s3",
        type: "flashcards",
        label: "Review: Server Components",
        description: "7 flashcards on rack units, core components, ECC, hot-swap, and failure rates",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "hw-m01-cards",
          params: {
            topicId: "hardware",
            tier: 1,
            cardIds: ["hw-013", "hw-001", "hw-007", "hw-004", "hw-006", "hw-011", "hw-023"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 8 of 10 on the multiple choice exam",
      passThreshold: 0.8,
      items: [
        { type: "multiple-choice", contentRef: "hw-m01-q01" },
        { type: "multiple-choice", contentRef: "hw-m01-q02" },
        { type: "multiple-choice", contentRef: "hw-m01-q03" },
        { type: "multiple-choice", contentRef: "hw-m01-q04" },
        { type: "multiple-choice", contentRef: "hw-m01-q05" },
        { type: "multiple-choice", contentRef: "hw-m01-q06" },
        { type: "multiple-choice", contentRef: "hw-m01-q07" },
        { type: "multiple-choice", contentRef: "hw-m01-q08" },
        { type: "multiple-choice", contentRef: "hw-m01-q09" },
        { type: "multiple-choice", contentRef: "hw-m01-q10" },
      ],
    },
    mapPosition: { x: 50, y: 0 },
    connections: ["hw-m02"],
  },
  {
    id: "hw-m02",
    campaignId: "hardware-core",
    title: "GPUs & Accelerators",
    description: "Why GPUs win at AI, how TDP drives rack design, and what NVLink + NVSwitch actually do.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "hw-m02-s1",
        type: "reading",
        label: "Read: Why GPUs Win at AI",
        description: "CPU vs GPU, memory bandwidth, HBM3, TDP and rack power math",
        estimatedMinutes: 10,
        required: true,
        contentRef: { kind: "chapter-section", id: "hw-s3" },
      },
      {
        id: "hw-m02-s2",
        type: "reading",
        label: "Read: Interconnects",
        description: "PCIe Gen 5, NVLink, NVSwitch fabric, InfiniBand vs RoCE, firmware discipline",
        estimatedMinutes: 8,
        required: true,
        contentRef: { kind: "chapter-section", id: "hw-s4" },
      },
      {
        id: "hw-m02-s3",
        type: "flashcards",
        label: "Review: GPUs & Interconnects",
        description: "8 flashcards on H100 TDP, NVLink, PCIe, InfiniBand, NVSwitch, and diagnosis",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "hw-m02-cards",
          params: {
            topicId: "hardware",
            tier: 1,
            cardIds: ["hw-009", "hw-002", "hw-003", "hw-010", "hwf-002", "hw-103", "hw-104", "hw-101"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 6 of 8 on the multiple choice exam",
      passThreshold: 0.75,
      items: [
        { type: "multiple-choice", contentRef: "hw-m02-q01" },
        { type: "multiple-choice", contentRef: "hw-m02-q02" },
        { type: "multiple-choice", contentRef: "hw-m02-q03" },
        { type: "multiple-choice", contentRef: "hw-m02-q04" },
        { type: "multiple-choice", contentRef: "hw-m02-q05" },
        { type: "multiple-choice", contentRef: "hw-m02-q06" },
        { type: "multiple-choice", contentRef: "hw-m02-q07" },
        { type: "multiple-choice", contentRef: "hw-m02-q08" },
      ],
    },
    mapPosition: { x: 50, y: 1 },
    connections: ["hw-m01", "hw-m03"],
  },
  {
    id: "hw-m03",
    campaignId: "hardware-core",
    title: "Memory & Storage",
    description: "Why DIMM layout beats total GB, why ECC is non-negotiable, and how drives report failure before they die.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "hw-m03-s1",
        type: "reading",
        label: "Read: DIMMs, ECC, and Memory Channels",
        description: "Memory channels, NUMA, ECC correctable vs uncorrectable, edac-util",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "hw-s5" },
      },
      {
        id: "hw-m03-s2",
        type: "reading",
        label: "Read: NVMe, SAS, RAID, and SMART",
        description: "Drive types, RAID levels, hardware vs software RAID, SMART attributes that matter",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "hw-s6" },
      },
      {
        id: "hw-m03-s3",
        type: "flashcards",
        label: "Review: Memory & Storage",
        description: "8 flashcards on DIMMs, ECC, memory channels, SAS vs NVMe, RAID, drive form factors",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "hw-m03-cards",
          params: {
            topicId: "hardware",
            tier: 1,
            cardIds: ["hw-007", "hw-004", "hwf-003", "hwf-005", "hw-008", "hw-012", "hw-019", "hw-102"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 6 of 8 on the multiple choice exam",
      passThreshold: 0.75,
      items: [
        { type: "multiple-choice", contentRef: "hw-m03-q01" },
        { type: "multiple-choice", contentRef: "hw-m03-q02" },
        { type: "multiple-choice", contentRef: "hw-m03-q03" },
        { type: "multiple-choice", contentRef: "hw-m03-q04" },
        { type: "multiple-choice", contentRef: "hw-m03-q05" },
        { type: "multiple-choice", contentRef: "hw-m03-q06" },
        { type: "multiple-choice", contentRef: "hw-m03-q07" },
        { type: "multiple-choice", contentRef: "hw-m03-q08" },
      ],
    },
    mapPosition: { x: 50, y: 2 },
    connections: ["hw-m02", "hw-m04"],
  },
  {
    id: "hw-m04",
    campaignId: "hardware-core",
    title: "BIOS & Firmware",
    description: "The pre-OS world: POST, UEFI, the BMC, and how to upgrade firmware without taking down the fleet.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "hw-m04-s1",
        type: "reading",
        label: "Read: UEFI, POST, and the Boot Order",
        description: "What POST does, UEFI vs legacy BIOS, efibootmgr, Secure Boot, PXE",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "hw-s7" },
      },
      {
        id: "hw-m04-s2",
        type: "reading",
        label: "Read: BMC, IPMI, and Firmware Discipline",
        description: "BMC capabilities, IPMI commands, SOL, staged firmware upgrades",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "hw-s8" },
      },
      {
        id: "hw-m04-s3",
        type: "flashcards",
        label: "Review: BIOS & Firmware",
        description: "8 flashcards on UEFI, BMC/IPMI, POST, firmware update order, labeling",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "hw-m04-cards",
          params: {
            topicId: "hardware",
            tier: 1,
            cardIds: ["hw-014", "hwf-012", "hw-005", "hwf-004", "hw-020", "hw-105", "hwf-009", "hw-018"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 6 of 8 on the multiple choice exam",
      passThreshold: 0.75,
      items: [
        { type: "multiple-choice", contentRef: "hw-m04-q01" },
        { type: "multiple-choice", contentRef: "hw-m04-q02" },
        { type: "multiple-choice", contentRef: "hw-m04-q03" },
        { type: "multiple-choice", contentRef: "hw-m04-q04" },
        { type: "multiple-choice", contentRef: "hw-m04-q05" },
        { type: "multiple-choice", contentRef: "hw-m04-q06" },
        { type: "multiple-choice", contentRef: "hw-m04-q07" },
        { type: "multiple-choice", contentRef: "hw-m04-q08" },
      ],
    },
    mapPosition: { x: 50, y: 3 },
    connections: ["hw-m03"],
  },
];

export const DC_MISSIONS: Mission[] = [
  // Hardware — fully authored
  ...HARDWARE_MISSIONS,

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
