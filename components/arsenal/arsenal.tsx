"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HexPanel from "@/components/ui/hex-panel";
import StatusBadge from "@/components/ui/status-badge";
import ActionButton from "@/components/ui/action-button";
import ScanOverlay from "@/components/ui/scan-overlay";

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "learn" | "practice" | "test" | "prepare" | "tools";
  blooms: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "Mixed";
  topics: string[];
  estimatedMinutes: number;
  route: string;
}

const ACTIVITIES: Activity[] = [
  // LEARN
  { id: "boot-learn", title: "Boot Process — Learn", description: "Interactive 3-layer boot sequence walkthrough", icon: "🔄", category: "learn", blooms: "Understand", topics: ["linux"], estimatedMinutes: 15, route: "/boot-learn" },
  { id: "filesystem-explorer", title: "Filesystem Navigator", description: "Interactive Linux directory tree with descriptions", icon: "📁", category: "learn", blooms: "Remember", topics: ["linux"], estimatedMinutes: 10, route: "/filesystem-navigator" },
  { id: "command-dissector", title: "Command Dissector", description: "Break down commands into parts — command, flags, arguments", icon: "🔬", category: "learn", blooms: "Understand", topics: ["linux"], estimatedMinutes: 10, route: "/command-dissector" },
  { id: "fs-types", title: "Filesystem Types", description: "Compare ext4, XFS, btrfs, NFS, tmpfs, overlay", icon: "💾", category: "learn", blooms: "Remember", topics: ["linux"], estimatedMinutes: 8, route: "/filesystem-types" },

  // PRACTICE
  { id: "flashcards", title: "Flashcard Review", description: "Spaced-repetition review by topic, tier, or mixed", icon: "🃏", category: "practice", blooms: "Remember", topics: ["linux", "hardware", "networking", "fiber", "power-cooling", "ops-processes", "scale"], estimatedMinutes: 10, route: "/study" },
  { id: "qd-permissions", title: "Quick Draw: Permissions", description: "Convert between rwx and octal notation", icon: "⚡", category: "practice", blooms: "Apply", difficulty: "Medium", topics: ["linux"], estimatedMinutes: 5, route: "/train/quick-draw" },
  { id: "qd-ports", title: "Quick Draw: Ports", description: "Match services to port numbers", icon: "⚡", category: "practice", blooms: "Remember", difficulty: "Easy", topics: ["networking"], estimatedMinutes: 5, route: "/train/quick-draw" },
  { id: "qd-signals", title: "Quick Draw: Signals", description: "Signal names, numbers, and when to use them", icon: "⚡", category: "practice", blooms: "Remember", difficulty: "Easy", topics: ["linux"], estimatedMinutes: 4, route: "/train/quick-draw" },
  { id: "qd-ip", title: "Quick Draw: IP Ranges", description: "Private ranges, subnets, CIDR notation", icon: "⚡", category: "practice", blooms: "Apply", difficulty: "Medium", topics: ["networking"], estimatedMinutes: 5, route: "/train/quick-draw" },
  { id: "qd-ssh", title: "Quick Draw: SSH", description: "Build SSH and SCP commands from requirements", icon: "⚡", category: "practice", blooms: "Apply", difficulty: "Medium", topics: ["linux"], estimatedMinutes: 5, route: "/train/quick-draw" },
  { id: "qd-commands", title: "Quick Draw: Commands", description: "Name the command from its description", icon: "⚡", category: "practice", blooms: "Remember", difficulty: "Easy", topics: ["linux"], estimatedMinutes: 5, route: "/train/quick-draw" },
  { id: "qd-command-recall", title: "Quick Draw: Command Recall", description: "75 commands — given a description, name the command", icon: "⚡", category: "practice", blooms: "Remember", difficulty: "Hard", topics: ["linux"], estimatedMinutes: 8, route: "/train/quick-draw" },
  { id: "qd-flag-sniper", title: "Quick Draw: Flag Sniper", description: "100+ flags — given a flag, name what it does", icon: "⚡", category: "practice", blooms: "Remember", difficulty: "Hard", topics: ["linux"], estimatedMinutes: 8, route: "/train/quick-draw" },
  { id: "fs-label-quiz", title: "Filesystem Label Quiz", description: "Given a description, type the correct Linux path", icon: "🏷", category: "practice", blooms: "Apply", difficulty: "Medium", topics: ["linux"], estimatedMinutes: 8, route: "/filesystem-navigator?mode=label" },
  { id: "terminal", title: "Terminal Simulator", description: "Practice Linux commands in a simulated environment", icon: "💻", category: "practice", blooms: "Apply", topics: ["linux"], estimatedMinutes: 15, route: "/terminal" },

  // TEST
  { id: "diagnosis", title: "Diagnosis Lab", description: "Multi-step troubleshooting scenarios by difficulty", icon: "🔍", category: "test", blooms: "Analyze", difficulty: "Mixed", topics: ["linux", "hardware", "networking"], estimatedMinutes: 10, route: "/train/diagnosis" },
  { id: "drills", title: "Incident Drills", description: "Live incident response scenarios with key-term scoring", icon: "🚨", category: "test", blooms: "Evaluate", difficulty: "Hard", topics: ["linux", "hardware", "networking"], estimatedMinutes: 10, route: "/drill" },
  { id: "boot-triage", title: "Boot Triage", description: "Diagnose boot failures from symptoms and logs", icon: "🔧", category: "test", blooms: "Analyze", difficulty: "Medium", topics: ["linux"], estimatedMinutes: 10, route: "/boot-triage" },
  { id: "fs-types-quiz", title: "Filesystem Types Quiz", description: "Identify the filesystem from a scenario description", icon: "🎯", category: "test", blooms: "Analyze", difficulty: "Medium", topics: ["linux"], estimatedMinutes: 6, route: "/filesystem-types?mode=quiz" },

  // PREPARE
  { id: "mock-interview", title: "Mock Interview", description: "AI-scored behavioral and technical interview practice", icon: "🎤", category: "prepare", blooms: "Evaluate", topics: ["behavioral"], estimatedMinutes: 15, route: "/interview/mock" },
  { id: "stories", title: "Story Bank", description: "Build and rehearse STAR stories for interviews", icon: "📝", category: "prepare", blooms: "Apply", topics: ["behavioral"], estimatedMinutes: 10, route: "/stories" },

  // TOOLS
  { id: "cards", title: "Card Browser", description: "Browse and search all flashcards in the system", icon: "🗃️", category: "tools", blooms: "Remember", topics: [], estimatedMinutes: 5, route: "/cards" },
  { id: "agent", title: "Agent Chat", description: "AI study companion for personalized coaching", icon: "🤖", category: "tools", blooms: "Understand", topics: [], estimatedMinutes: 10, route: "/agent" },
];

const CATEGORIES = [
  { key: "learn", label: "Learn", description: "Understand new concepts" },
  { key: "practice", label: "Practice", description: "Reinforce knowledge" },
  { key: "test", label: "Test", description: "Prove mastery" },
  { key: "prepare", label: "Prepare", description: "Interview readiness" },
  { key: "tools", label: "Tools", description: "Utilities" },
] as const;

const bloomsVariant = (b: string) =>
  b === "Remember" ? "success" :
  b === "Understand" ? "cyan" :
  b === "Apply" ? "blue" :
  b === "Analyze" ? "purple" :
  b === "Evaluate" ? "warning" : "cyan";

const difficultyVariant = (d: string) =>
  d === "Easy" ? "success" :
  d === "Medium" ? "warning" :
  d === "Hard" ? "danger" :
  d === "Mixed" ? "purple" : "muted";

export default function Arsenal() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("");

  const filtered = filter
    ? ACTIVITIES.filter(
        (a) =>
          a.title.toLowerCase().includes(filter.toLowerCase()) ||
          a.topics.some((t) => t.includes(filter.toLowerCase())) ||
          a.blooms.toLowerCase().includes(filter.toLowerCase()) ||
          (a.difficulty && a.difficulty.toLowerCase().includes(filter.toLowerCase()))
      )
    : ACTIVITIES;

  return (
    <div className="relative min-h-screen bg-v2-bg-deep">
      <ScanOverlay />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="display-font text-xl text-v2-cyan tracking-widest">Arsenal</h1>
          <input
            type="text"
            placeholder="Filter activities..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-v2-bg-elevated border border-v2-border rounded px-3 py-1.5 text-sm text-v2-text placeholder:text-v2-text-muted focus:border-v2-cyan/50 focus:outline-none w-48"
          />
        </div>

        {/* Categories */}
        {CATEGORIES.map(({ key, label, description }) => {
          const items = filtered.filter((a) => a.category === key);
          if (items.length === 0) return null;

          return (
            <section key={key}>
              <div className="mb-2">
                <h2 className="display-font text-sm text-v2-text tracking-wider">{label}</h2>
                <p className="text-xs text-v2-text-muted">{description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((activity) => (
                  <HexPanel
                    key={activity.id}
                    size="sm"
                    onClick={() => router.push(activity.route)}
                    className="hover:border-v2-cyan/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{activity.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-v2-text truncate">
                          {activity.title}
                        </h3>
                        <p className="text-xs text-v2-text-dim line-clamp-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <StatusBadge label={activity.blooms} variant={bloomsVariant(activity.blooms) as any} />
                          {activity.difficulty && (
                            <StatusBadge label={activity.difficulty} variant={difficultyVariant(activity.difficulty) as any} />
                          )}
                          <StatusBadge label={`~${activity.estimatedMinutes}m`} variant="muted" />
                        </div>
                      </div>
                    </div>
                  </HexPanel>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
