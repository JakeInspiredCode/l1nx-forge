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

// ── Full Networking missions (net-m01..net-m04) ──
// 2 readings (chapter-section) + 1 curated flashcards step + 8–10 MCQs, mirrors Hardware Core shape.

const NETWORKING_MISSIONS: Mission[] = [
  {
    id: "net-m01",
    campaignId: "networking-core",
    title: "OSI & TCP/IP",
    description: "The layered model in one sitting: how a URL becomes packets, and the six commands that solve most outages.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "net-m01-s1",
        type: "reading",
        label: "Read: Layers, Frames, and Packets",
        description: "The OSI/TCP-IP model, encapsulation, and which layer each tool targets",
        estimatedMinutes: 10,
        required: true,
        contentRef: { kind: "chapter-section", id: "net-s1" },
      },
      {
        id: "net-m01-s2",
        type: "reading",
        label: "Read: TCP, UDP, and the Essential Tools",
        description: "3-way handshake, MTU/jumbo frames, and the six go-to commands",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "net-s2" },
      },
      {
        id: "net-m01-s3",
        type: "flashcards",
        label: "Review: Layers & Transport",
        description: "8 flashcards on IP addressing, TCP/UDP, MTU, ports, ping/traceroute/ss",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "net-m01-cards",
          params: {
            topicId: "networking",
            tier: 1,
            cardIds: ["net-011", "net-013", "net-018", "net-022", "net-019", "net-020", "net-021", "net-004"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 8 of 10 on the multiple choice exam",
      passThreshold: 0.8,
      items: [
        { type: "multiple-choice", contentRef: "net-m01-q01" },
        { type: "multiple-choice", contentRef: "net-m01-q02" },
        { type: "multiple-choice", contentRef: "net-m01-q03" },
        { type: "multiple-choice", contentRef: "net-m01-q04" },
        { type: "multiple-choice", contentRef: "net-m01-q05" },
        { type: "multiple-choice", contentRef: "net-m01-q06" },
        { type: "multiple-choice", contentRef: "net-m01-q07" },
        { type: "multiple-choice", contentRef: "net-m01-q08" },
        { type: "multiple-choice", contentRef: "net-m01-q09" },
        { type: "multiple-choice", contentRef: "net-m01-q10" },
      ],
    },
    mapPosition: { x: 50, y: 0 },
    connections: ["net-m02"],
  },
  {
    id: "net-m02",
    campaignId: "networking-core",
    title: "Switching & VLANs",
    description: "What the ToR switch actually does, how VLANs carve one wire into ten networks, and LACP bonding done right.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "net-m02-s1",
        type: "reading",
        label: "Read: Switching, MAC Learning, and ARP",
        description: "MAC tables, ARP, broadcast domains, and why DCs killed STP",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "net-s3" },
      },
      {
        id: "net-m02-s2",
        type: "reading",
        label: "Read: VLANs, Trunks, and LACP",
        description: "802.1Q tagging, access vs trunk, native VLAN trap, LACP bonding",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "net-s4" },
      },
      {
        id: "net-m02-s3",
        type: "flashcards",
        label: "Review: L2 & VLANs",
        description: "9 flashcards on L2 vs L3, ARP, VLANs, trunks, LACP",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "net-m02-cards",
          params: {
            topicId: "networking",
            tier: 1,
            cardIds: ["net-003", "net-010", "net-001", "net-014", "net-005", "netf-001", "netf-004", "netf-008", "net-004"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 6 of 8 on the multiple choice exam",
      passThreshold: 0.75,
      items: [
        { type: "multiple-choice", contentRef: "net-m02-q01" },
        { type: "multiple-choice", contentRef: "net-m02-q02" },
        { type: "multiple-choice", contentRef: "net-m02-q03" },
        { type: "multiple-choice", contentRef: "net-m02-q04" },
        { type: "multiple-choice", contentRef: "net-m02-q05" },
        { type: "multiple-choice", contentRef: "net-m02-q06" },
        { type: "multiple-choice", contentRef: "net-m02-q07" },
        { type: "multiple-choice", contentRef: "net-m02-q08" },
      ],
    },
    mapPosition: { x: 50, y: 1 },
    connections: ["net-m01", "net-m03"],
  },
  {
    id: "net-m03",
    campaignId: "networking-core",
    title: "IP & Routing",
    description: "CIDR math, routing tables, and the leaf-spine fabric that makes an AI datacenter actually work.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "net-m03-s1",
        type: "reading",
        label: "Read: IPv4, Subnetting, and Routing",
        description: "CIDR notation, private ranges, default gateway, reading the routing table",
        estimatedMinutes: 10,
        required: true,
        contentRef: { kind: "chapter-section", id: "net-s5" },
      },
      {
        id: "net-m03-s2",
        type: "reading",
        label: "Read: Leaf-Spine, BGP, and ECMP",
        description: "L3-to-the-ToR, BGP in the DC, ECMP hashing, elephant flows, hash polarization",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "net-s6" },
      },
      {
        id: "net-m03-s3",
        type: "flashcards",
        label: "Review: IP & Fabric",
        description: "9 flashcards on IPv4/CIDR, gateways, BGP, leaf-spine, ECMP",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "net-m03-cards",
          params: {
            topicId: "networking",
            tier: 1,
            cardIds: ["net-012", "net-013", "net-016", "net-002", "net-006", "net-015", "netf-002", "netf-005", "net-102"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 6 of 8 on the multiple choice exam",
      passThreshold: 0.75,
      items: [
        { type: "multiple-choice", contentRef: "net-m03-q01" },
        { type: "multiple-choice", contentRef: "net-m03-q02" },
        { type: "multiple-choice", contentRef: "net-m03-q03" },
        { type: "multiple-choice", contentRef: "net-m03-q04" },
        { type: "multiple-choice", contentRef: "net-m03-q05" },
        { type: "multiple-choice", contentRef: "net-m03-q06" },
        { type: "multiple-choice", contentRef: "net-m03-q07" },
        { type: "multiple-choice", contentRef: "net-m03-q08" },
      ],
    },
    mapPosition: { x: 50, y: 2 },
    connections: ["net-m02", "net-m04"],
  },
  {
    id: "net-m04",
    campaignId: "networking-core",
    title: "DNS & Load Balancing",
    description: "Name resolution, DHCP, and the two very different load-balancers in every AI DC — from HAProxy to RDMA fabrics.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "net-m04-s1",
        type: "reading",
        label: "Read: DNS, DHCP, and Name Resolution",
        description: "Record types, recursion, TTLs, DORA, and the tools that debug them",
        estimatedMinutes: 10,
        required: true,
        contentRef: { kind: "chapter-section", id: "net-s7" },
      },
      {
        id: "net-m04-s2",
        type: "reading",
        label: "Read: Load Balancing, RDMA, and AI Fabrics",
        description: "L4 vs L7, anycast, RDMA kernel bypass, RoCE vs InfiniBand, ECN/PFC",
        estimatedMinutes: 10,
        required: true,
        contentRef: { kind: "chapter-section", id: "net-s8" },
      },
      {
        id: "net-m04-s3",
        type: "flashcards",
        label: "Review: DNS & AI Fabric",
        description: "8 flashcards on DNS, DHCP, RDMA, RoCE vs IB, anycast, common ports",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "net-m04-cards",
          params: {
            topicId: "networking",
            tier: 1,
            cardIds: ["net-008", "net-007", "net-017", "netf-006", "net-018", "net-009", "net-103", "net-106"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 6 of 8 on the multiple choice exam",
      passThreshold: 0.75,
      items: [
        { type: "multiple-choice", contentRef: "net-m04-q01" },
        { type: "multiple-choice", contentRef: "net-m04-q02" },
        { type: "multiple-choice", contentRef: "net-m04-q03" },
        { type: "multiple-choice", contentRef: "net-m04-q04" },
        { type: "multiple-choice", contentRef: "net-m04-q05" },
        { type: "multiple-choice", contentRef: "net-m04-q06" },
        { type: "multiple-choice", contentRef: "net-m04-q07" },
        { type: "multiple-choice", contentRef: "net-m04-q08" },
      ],
    },
    mapPosition: { x: 50, y: 3 },
    connections: ["net-m03"],
  },
];

// ── Full Ops & Processes missions (ops-m01..ops-m04) ──
// 2 readings (chapter-section) + 1 curated flashcards step + 8–10 MCQs.

const OPS_MISSIONS: Mission[] = [
  {
    id: "ops-m01",
    campaignId: "ops-core",
    title: "Incident Response",
    description: "What happens between the 02:17 page and the all-clear — the IC role, stop-the-bleeding discipline, and MTTR as the north star.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "ops-m01-s1",
        type: "reading",
        label: "Read: The Incident Lifecycle",
        description: "Five phases, the IC role, MTTR vs MTTRk, taking notes as you go",
        estimatedMinutes: 10,
        required: true,
        contentRef: { kind: "chapter-section", id: "ops-s1" },
      },
      {
        id: "ops-m01-s2",
        type: "reading",
        label: "Read: Severity, Escalation, and Communication",
        description: "P1–P4 rubric, L1→L3 escalation, audience-aware comms, shift handoff",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "ops-s2" },
      },
      {
        id: "ops-m01-s3",
        type: "flashcards",
        label: "Review: Incident Response",
        description: "8 flashcards on incident phases, severity, MTTR, escalation, handoff",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "ops-m01-cards",
          params: {
            topicId: "ops-processes",
            tier: 1,
            cardIds: ["ops-001", "ops-006", "ops-002", "ops-008", "ops-009", "ops-015", "opsf-003", "opsf-004"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 8 of 10 on the multiple choice exam",
      passThreshold: 0.8,
      items: [
        { type: "multiple-choice", contentRef: "ops-m01-q01" },
        { type: "multiple-choice", contentRef: "ops-m01-q02" },
        { type: "multiple-choice", contentRef: "ops-m01-q03" },
        { type: "multiple-choice", contentRef: "ops-m01-q04" },
        { type: "multiple-choice", contentRef: "ops-m01-q05" },
        { type: "multiple-choice", contentRef: "ops-m01-q06" },
        { type: "multiple-choice", contentRef: "ops-m01-q07" },
        { type: "multiple-choice", contentRef: "ops-m01-q08" },
        { type: "multiple-choice", contentRef: "ops-m01-q09" },
        { type: "multiple-choice", contentRef: "ops-m01-q10" },
      ],
    },
    mapPosition: { x: 50, y: 0 },
    connections: ["ops-m02"],
  },
  {
    id: "ops-m02",
    campaignId: "ops-core",
    title: "Change Management",
    description: "Most outages are self-inflicted. CAB, staged rollouts, rollback discipline, and how MOPs survive 02:00 bridges.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "ops-m02-s1",
        type: "reading",
        label: "Read: Changes, Risk, and Rollback",
        description: "Standard/normal/emergency, CAB, blast radius, staged rollout, rollback plans",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "ops-s3" },
      },
      {
        id: "ops-m02-s2",
        type: "reading",
        label: "Read: Maintenance Windows and MOPs",
        description: "SOP vs MOP vs runbook, MOP structure, dry run, go/no-go, silent-failure discipline",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "ops-s4" },
      },
      {
        id: "ops-m02-s3",
        type: "flashcards",
        label: "Review: Change Management",
        description: "7 flashcards on change process, MOP vs SOP, maintenance windows, CAB, ticketing",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "ops-m02-cards",
          params: {
            topicId: "ops-processes",
            tier: 1,
            cardIds: ["ops-003", "ops-010", "ops-011", "ops-012", "ops-014", "ops-008", "ops-102"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 6 of 8 on the multiple choice exam",
      passThreshold: 0.75,
      items: [
        { type: "multiple-choice", contentRef: "ops-m02-q01" },
        { type: "multiple-choice", contentRef: "ops-m02-q02" },
        { type: "multiple-choice", contentRef: "ops-m02-q03" },
        { type: "multiple-choice", contentRef: "ops-m02-q04" },
        { type: "multiple-choice", contentRef: "ops-m02-q05" },
        { type: "multiple-choice", contentRef: "ops-m02-q06" },
        { type: "multiple-choice", contentRef: "ops-m02-q07" },
        { type: "multiple-choice", contentRef: "ops-m02-q08" },
      ],
    },
    mapPosition: { x: 50, y: 1 },
    connections: ["ops-m01", "ops-m03"],
  },
  {
    id: "ops-m03",
    campaignId: "ops-core",
    title: "Monitoring & Alerting",
    description: "The golden signals, SLIs/SLOs, error budget and burn rate — and the on-call discipline that cures alert fatigue.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "ops-m03-s1",
        type: "reading",
        label: "Read: What to Monitor and Why",
        description: "Four golden signals, three pillars of observability, SLIs, dashboards that help",
        estimatedMinutes: 10,
        required: true,
        contentRef: { kind: "chapter-section", id: "ops-s5" },
      },
      {
        id: "ops-m03-s2",
        type: "reading",
        label: "Read: Alerts, Thresholds, and On-Call",
        description: "The three-test rule, SLO / error budget / burn rate, multi-window alerting, healthy on-call",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "ops-s6" },
      },
      {
        id: "ops-m03-s3",
        type: "flashcards",
        label: "Review: Monitoring & Alerting",
        description: "8 flashcards on key metrics, SLI/SLO/SLA, monitoring tools, golden signals, burn rate, alert fatigue",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "ops-m03-cards",
          params: {
            topicId: "ops-processes",
            tier: 1,
            cardIds: ["ops-005", "ops-007", "opsf-002", "ops-103", "ops-104", "ops-105", "ops-101", "ops-002"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 6 of 8 on the multiple choice exam",
      passThreshold: 0.75,
      items: [
        { type: "multiple-choice", contentRef: "ops-m03-q01" },
        { type: "multiple-choice", contentRef: "ops-m03-q02" },
        { type: "multiple-choice", contentRef: "ops-m03-q03" },
        { type: "multiple-choice", contentRef: "ops-m03-q04" },
        { type: "multiple-choice", contentRef: "ops-m03-q05" },
        { type: "multiple-choice", contentRef: "ops-m03-q06" },
        { type: "multiple-choice", contentRef: "ops-m03-q07" },
        { type: "multiple-choice", contentRef: "ops-m03-q08" },
      ],
    },
    mapPosition: { x: 50, y: 2 },
    connections: ["ops-m02", "ops-m04"],
  },
  {
    id: "ops-m04",
    campaignId: "ops-core",
    title: "Documentation & Runbooks",
    description: "The institutional memory practice — runbooks that survive drift, blameless post-incident reviews, and action items that stick.",
    estimatedMinutes: 25,
    defaultLoadout: [
      {
        id: "ops-m04-s1",
        type: "reading",
        label: "Read: Runbooks, SOPs, and Institutional Memory",
        description: "SOP vs MOP vs runbook, structure, drift prevention, shift handoff, game days",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "ops-s7" },
      },
      {
        id: "ops-m04-s2",
        type: "reading",
        label: "Read: Post-Incident Reviews and Learning",
        description: "Blameless framing, PIR structure, 5 whys, sticky action items, meta-review across incidents",
        estimatedMinutes: 9,
        required: true,
        contentRef: { kind: "chapter-section", id: "ops-s8" },
      },
      {
        id: "ops-m04-s3",
        type: "flashcards",
        label: "Review: Documentation & Runbooks",
        description: "7 flashcards on runbook contents, PIR, documentation standards, SOP vs MOP, handoff",
        estimatedMinutes: 5,
        required: false,
        contentRef: {
          kind: "card-set",
          id: "ops-m04-cards",
          params: {
            topicId: "ops-processes",
            tier: 1,
            cardIds: ["ops-004", "opsf-001", "ops-013", "ops-014", "ops-010", "ops-011", "ops-015"],
          },
        },
      },
    ],
    knowledgeCheck: {
      type: "mixed",
      description: "Score 6 of 8 on the multiple choice exam",
      passThreshold: 0.75,
      items: [
        { type: "multiple-choice", contentRef: "ops-m04-q01" },
        { type: "multiple-choice", contentRef: "ops-m04-q02" },
        { type: "multiple-choice", contentRef: "ops-m04-q03" },
        { type: "multiple-choice", contentRef: "ops-m04-q04" },
        { type: "multiple-choice", contentRef: "ops-m04-q05" },
        { type: "multiple-choice", contentRef: "ops-m04-q06" },
        { type: "multiple-choice", contentRef: "ops-m04-q07" },
        { type: "multiple-choice", contentRef: "ops-m04-q08" },
      ],
    },
    mapPosition: { x: 50, y: 3 },
    connections: ["ops-m03"],
  },
];

export const DC_MISSIONS: Mission[] = [
  // Hardware — fully authored
  ...HARDWARE_MISSIONS,

  // Networking — fully authored
  ...NETWORKING_MISSIONS,

  // Fiber
  stubMission("fib-m01", "fiber-core", "Fiber Fundamentals", "Single-mode vs multi-mode, wavelengths", 0, ["fib-m02"]),
  stubMission("fib-m02", "fiber-core", "Transceivers & Connectors", "SFP+, QSFP, LC, MPO connectors", 1, ["fib-m01", "fib-m03"]),
  stubMission("fib-m03", "fiber-core", "Cable Management", "Patching, cleaning, testing, documentation", 2, ["fib-m02"]),

  // Power & Cooling
  stubMission("pwr-m01", "power-core", "Power Distribution", "PDUs, circuits, redundancy, metering", 0, ["pwr-m02"]),
  stubMission("pwr-m02", "power-core", "UPS & Backup", "UPS types, battery runtime, transfer switches", 1, ["pwr-m01", "pwr-m03"]),
  stubMission("pwr-m03", "power-core", "Cooling Systems", "CRAC, hot/cold aisle, liquid cooling, PUE", 2, ["pwr-m02"]),

  // Ops — fully authored
  ...OPS_MISSIONS,

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
