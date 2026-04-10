"use client";

import { useRouter } from "next/navigation";
import ScanOverlay from "@/components/ui/scan-overlay";
import StarfieldCanvas from "@/components/star-map/starfield-canvas";

const accentColor = "#a855f7";

// SVG icons per channel
function ChannelIcon({ id }: { id: string }) {
  const color = accentColor;
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "mock-interview":
      // Microphone
      return <svg {...common}><rect x="5.5" y="1" width="5" height="8" rx="2.5" /><path d="M3 7a5 5 0 0010 0" /><line x1="8" y1="12" x2="8" y2="15" /><line x1="5" y1="15" x2="11" y2="15" /></svg>;
    case "agent":
      // Signal / antenna
      return <svg {...common}><circle cx="8" cy="12" r="1.5" fill={color} stroke="none" opacity={0.5} /><path d="M5 10a4 4 0 016 0" /><path d="M3 8a7 7 0 0110 0" /><path d="M1 6a10 10 0 0114 0" /></svg>;
    case "stories":
      // Document / notepad
      return <svg {...common}><rect x="3" y="1" width="10" height="14" rx="1.5" /><line x1="6" y1="5" x2="10" y2="5" /><line x1="6" y1="8" x2="10" y2="8" /><line x1="6" y1="11" x2="9" y2="11" /></svg>;
    default:
      return <svg {...common}><circle cx="8" cy="8" r="5" /></svg>;
  }
}

const CHANNELS = [
  {
    id: "mock-interview",
    title: "Mock Interview",
    description: "AI-scored behavioral and technical interview practice",
    route: "/interview/mock",
    frequency: "CH-01",
  },
  {
    id: "agent",
    title: "Agent Chat",
    description: "AI study companion for personalized coaching and Q&A",
    route: "/agent",
    frequency: "CH-02",
  },
  {
    id: "stories",
    title: "Story Bank",
    description: "Build and rehearse STAR stories for behavioral interviews",
    route: "/stories",
    frequency: "CH-03",
  },
];

export default function CommsPage() {
  const router = useRouter();

  return (
    <div className="h-[calc(100vh-48px)] w-full relative overflow-hidden">
      <StarfieldCanvas />
      <ScanOverlay />
      <div className="viewport-vignette fixed inset-0 z-[8] pointer-events-none" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="galaxy-header-bar">
          <div className="header-accent-line" />
          <div className="flex items-center gap-3">
            <div className="header-diamond" style={{ background: `${accentColor}66`, boxShadow: `0 0 8px ${accentColor}50` }} />
            <h1 className="galaxy-title" style={{ textShadow: `0 0 20px ${accentColor}40, 0 0 40px ${accentColor}15` }}>
              Communications
            </h1>
            <div className="header-diamond" style={{ background: `${accentColor}66`, boxShadow: `0 0 8px ${accentColor}50` }} />
          </div>
          <div className="header-accent-line" />
        </div>
      </div>

      {/* Main layout */}
      <div className="absolute inset-0 z-[5] flex flex-col sm:flex-row pt-11 pb-1 px-1 gap-2">
        {/* Channel list — glass panel sidebar */}
        <div className="sm:w-52 md:w-64 shrink-0 flex flex-col">
          <div className="glass-panel-header">
            <span>Channels</span>
          </div>
          <div className="flex-1 glass-panel rounded-b-lg p-3 overflow-auto">
            <div className="flex sm:flex-col gap-1.5 overflow-x-auto sm:overflow-visible">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => router.push(ch.route)}
                  className="w-full shrink-0 sm:shrink text-left group transition-all duration-200"
                >
                  <div
                    className="px-3 py-2.5 rounded-lg"
                    style={{
                      background: `${accentColor}04`,
                      border: `1px solid ${accentColor}10`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                        style={{ background: `${accentColor}10` }}
                      >
                        <ChannelIcon id={ch.id} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[11px] display-font tracking-wider uppercase truncate group-hover:text-white transition-colors"
                          style={{ color: "#e0e4ec" }}
                        >
                          {ch.title}
                        </div>
                        <div className="text-[8px] telemetry-font text-[#6a7288] tracking-wider">
                          {ch.frequency}
                        </div>
                      </div>
                      <svg
                        width="8" height="8" viewBox="0 0 8 8"
                        className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                        fill="none" stroke={accentColor} strokeWidth="1.2"
                      >
                        <polyline points="2,1 6,4 2,7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main area — channel selection prompt */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="glass-panel-header">
            <span>Transmissions</span>
          </div>
          <div className="flex-1 glass-panel rounded-b-lg flex items-center justify-center">
            <div className="text-center space-y-5">
              {/* Radar/signal SVG icon */}
              <div className="flex justify-center">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.15}>
                  <circle cx="24" cy="24" r="4" fill={accentColor} />
                  <circle cx="24" cy="24" r="12" stroke={accentColor} strokeWidth="1" />
                  <circle cx="24" cy="24" r="20" stroke={accentColor} strokeWidth="0.8" strokeDasharray="3 4" />
                  <circle cx="24" cy="24" r="28" stroke={accentColor} strokeWidth="0.5" strokeDasharray="2 5" />
                </svg>
              </div>
              <p className="text-[11px] text-[#8eafc8]">
                Select a channel to open communications
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => router.push(ch.route)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 group"
                    style={{
                      background: `${accentColor}06`,
                      border: `1px solid ${accentColor}20`,
                    }}
                  >
                    <ChannelIcon id={ch.id} />
                    <span
                      className="text-[10px] display-font tracking-wider uppercase group-hover:text-white transition-colors"
                      style={{ color: `${accentColor}cc` }}
                    >
                      {ch.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
