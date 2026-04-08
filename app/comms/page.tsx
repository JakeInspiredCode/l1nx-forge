"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HexPanel from "@/components/ui/hex-panel";
import ScanOverlay from "@/components/ui/scan-overlay";

const CHANNELS = [
  {
    id: "mock-interview",
    title: "Mock Interview",
    description: "AI-scored behavioral and technical interview practice",
    icon: "🎤",
    route: "/interview/mock",
    frequency: "CH-01",
  },
  {
    id: "agent",
    title: "Agent Chat",
    description: "AI study companion for personalized coaching and Q&A",
    icon: "🤖",
    route: "/agent",
    frequency: "CH-02",
  },
  {
    id: "stories",
    title: "Story Bank",
    description: "Build and rehearse STAR stories for behavioral interviews",
    icon: "📝",
    route: "/stories",
    frequency: "CH-03",
  },
];

export default function CommsPage() {
  const router = useRouter();
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <ScanOverlay />
      <div className="relative z-10 h-full flex">
        {/* Left panel — channel list */}
        <div className="w-64 h-full border-r border-v2-border p-5">
          <h1
            className="display-font text-xl tracking-[0.15em] mb-6"
            style={{
              color: "#a855f7",
              textShadow: "0 0 12px rgba(168, 85, 247, 0.3)",
            }}
          >
            Comms
          </h1>
          <div className="space-y-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => router.push(ch.route)}
                className={`w-full text-left px-3 py-3 rounded-lg border transition-all duration-200 group ${
                  activeChannel === ch.id
                    ? "bg-v2-purple/10 border-v2-purple/30"
                    : "border-transparent hover:bg-v2-bg-elevated hover:border-v2-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{ch.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-v2-text group-hover:text-v2-purple transition-colors">
                      {ch.title}
                    </div>
                    <div className="text-[10px] telemetry-font text-v2-text-muted tracking-wider">
                      {ch.frequency}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel — channel info */}
        <div className="flex-1 h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl opacity-20">◎</div>
            <p className="text-v2-text-dim text-sm">
              Select a channel to open communications
            </p>
            <div className="flex gap-3 justify-center">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => router.push(ch.route)}
                  className="px-4 py-2 text-xs rounded border border-v2-purple/30 text-v2-purple
                    hover:bg-v2-purple/10 hover:border-v2-purple/50 transition-all"
                  style={{ fontFamily: "'Chakra Petch', sans-serif", letterSpacing: "0.05em" }}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
