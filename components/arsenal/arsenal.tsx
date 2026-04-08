"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HexPanel from "@/components/ui/hex-panel";
import StatusBadge from "@/components/ui/status-badge";
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
  { key: "learn", label: "Learn", icon: "📖" },
  { key: "practice", label: "Practice", icon: "🎯" },
  { key: "test", label: "Test", icon: "🔬" },
  { key: "prepare", label: "Prepare", icon: "🎤" },
  { key: "tools", label: "Tools", icon: "🛠" },
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
  const [activeCategory, setActiveCategory] = useState<string>("learn");
  const [filter, setFilter] = useState("");

  const items = ACTIVITIES.filter((a) => {
    if (a.category !== activeCategory) return false;
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.topics.some((t) => t.includes(q)) ||
      a.blooms.toLowerCase().includes(q) ||
      (a.difficulty && a.difficulty.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <ScanOverlay />
      <div className="relative z-10 h-full flex">
        {/* Left sidebar — category rack */}
        <div className="w-20 h-full border-r border-v2-border flex flex-col items-center py-6 gap-2">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                activeCategory === key
                  ? "bg-v2-green/15 border border-v2-green/40 text-v2-green"
                  : "border border-transparent text-v2-text-muted hover:text-v2-text hover:bg-v2-bg-elevated"
              }`}
              title={label}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-[8px] tracking-wider uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 h-full p-6 overflow-auto scroll-container">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1
              className="display-font text-xl tracking-[0.15em]"
              style={{
                color: "#22c55e",
                textShadow: "0 0 12px rgba(34, 197, 94, 0.3)",
              }}
            >
              Arsenal
            </h1>
            <input
              type="text"
              placeholder="Filter..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-v2-bg-elevated border border-v2-border rounded px-3 py-1.5 text-sm text-v2-text placeholder:text-v2-text-muted focus:border-v2-green/50 focus:outline-none w-44"
            />
          </div>

          {/* Activity grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((activity) => (
              <HexPanel
                key={activity.id}
                size="sm"
                onClick={() => router.push(activity.route)}
                className="hover:border-v2-green/40 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-v2-text truncate group-hover:text-v2-green transition-colors">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-v2-text-dim line-clamp-1 mt-0.5">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
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

          {items.length === 0 && (
            <div className="text-center py-12 text-v2-text-dim text-sm">
              No activities match your filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
