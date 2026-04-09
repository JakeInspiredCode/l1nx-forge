import type { Sector } from "@/lib/types/campaign";

// ═══════════════════════════════════════════════════════════════════════════════
// Galaxy Map — Sector Definitions
// Each sector is a permanent region of the galaxy containing campaigns.
// Sectors don't change; the campaigns within them can.
// ═══════════════════════════════════════════════════════════════════════════════

export const ALL_SECTORS: Sector[] = [
  {
    id: "sector-linux",
    title: "Linux Operations",
    description: "The heart of the galaxy — master the command line, filesystem, permissions, processes, and system administration.",
    topicId: "linux",
    icon: "🐧",
    color: "#06d6d6",
    campaignIds: ["linux-core"],
    mapPosition: { x: 42, y: 40 },
    size: "lg",
  },
  {
    id: "sector-hardware",
    title: "Hardware Systems",
    description: "GPUs, CPUs, memory, storage, BIOS/UEFI, and the physical infrastructure that powers everything.",
    topicId: "hardware",
    icon: "🖥️",
    color: "#f59e0b",
    campaignIds: ["hardware-core"],
    mapPosition: { x: 12, y: 35 },
    size: "md",
  },
  {
    id: "sector-networking",
    title: "Networking",
    description: "TCP/IP, DNS, switching, routing, load balancing — the nervous system of the data center.",
    topicId: "networking",
    icon: "🌐",
    color: "#3b82f6",
    campaignIds: ["networking-core"],
    mapPosition: { x: 72, y: 22 },
    size: "md",
  },
  {
    id: "sector-fiber",
    title: "Fiber Optics",
    description: "Light-speed data paths — fiber types, connectors, transceivers, and optical network design.",
    topicId: "fiber",
    icon: "💡",
    color: "#a855f7",
    campaignIds: ["fiber-core"],
    mapPosition: { x: 78, y: 58 },
    size: "sm",
  },
  {
    id: "sector-power",
    title: "Power & Cooling",
    description: "UPS systems, PDUs, cooling architectures, and the energy backbone of the data center.",
    topicId: "power-cooling",
    icon: "⚡",
    color: "#ef4444",
    campaignIds: ["power-core"],
    mapPosition: { x: 22, y: 68 },
    size: "sm",
  },
  {
    id: "sector-ops",
    title: "Operations",
    description: "Change management, monitoring, alerting, documentation — keeping the fleet running.",
    topicId: "ops-processes",
    icon: "📋",
    color: "#22c55e",
    campaignIds: ["ops-core"],
    mapPosition: { x: 55, y: 72 },
    size: "md",
  },
  {
    id: "sector-scale",
    title: "Scale & Architecture",
    description: "Datacenter tiers, rack design, hyperscale vs colo — building for the future.",
    topicId: "scale",
    icon: "🏗️",
    color: "#ec4899",
    campaignIds: ["scale-core"],
    mapPosition: { x: 82, y: 40 },
    size: "sm",
  },
  {
    id: "sector-linux-advanced",
    title: "Advanced Linux",
    description: "Advanced Linux administration — systemd mastery, security hardening, bash scripting, LVM, containers, and cascading failure response.",
    topicId: "linux",
    icon: "🔧",
    color: "#a855f7",
    campaignIds: ["linux-advanced"],
    mapPosition: { x: 42, y: 14 },
    size: "md",
  },
];

// Lookup helpers
export function getSector(id: string) {
  return ALL_SECTORS.find((s) => s.id === id);
}

export function getSectorForCampaign(campaignId: string) {
  return ALL_SECTORS.find((s) => s.campaignIds.includes(campaignId));
}

export function getSectorByTopic(topicId: string) {
  return ALL_SECTORS.find((s) => s.topicId === topicId);
}
