"use client";

import { useRouter } from "next/navigation";
import Nav from "@/components/nav";
import HexPanel from "@/components/ui/hex-panel";
import ScanOverlay from "@/components/ui/scan-overlay";

const COMMS_ITEMS = [
  {
    id: "mock-interview",
    title: "Mock Interview",
    description: "AI-scored behavioral and technical interview practice",
    icon: "🎤",
    route: "/interview/mock",
  },
  {
    id: "agent",
    title: "Agent Chat",
    description: "AI study companion for personalized coaching and Q&A",
    icon: "🤖",
    route: "/agent",
  },
  {
    id: "stories",
    title: "Story Bank",
    description: "Build and rehearse STAR stories for behavioral interviews",
    icon: "📝",
    route: "/stories",
  },
];

export default function CommsPage() {
  const router = useRouter();

  return (
    <>
      <Nav />
      <main className="relative min-h-screen bg-v2-bg-deep">
        <ScanOverlay />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 space-y-6">
          <h1 className="display-font text-xl text-v2-cyan tracking-widest">Comms</h1>
          <div className="space-y-3">
            {COMMS_ITEMS.map((item) => (
              <HexPanel
                key={item.id}
                onClick={() => router.push(item.route)}
                className="hover:border-v2-cyan/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h2 className="text-base font-medium text-v2-text">{item.title}</h2>
                    <p className="text-sm text-v2-text-dim">{item.description}</p>
                  </div>
                </div>
              </HexPanel>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
