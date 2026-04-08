"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import HexPanel from "@/components/ui/hex-panel";
import GlowStat from "@/components/ui/glow-stat";
import TelemetryBar from "@/components/ui/telemetry-bar";
import ScanOverlay from "@/components/ui/scan-overlay";
import { TOPICS } from "@/lib/types";
import { useSoundEngine } from "@/lib/sound-engine";

type Tab = "stats" | "badges" | "settings";

export default function ProfilePage() {
  const profile = useQuery(api.forgeProfile.get);
  const allProgress = useQuery(api.forgeProgress.getAll);
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const sound = useSoundEngine();

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: "Stats" },
    { id: "badges", label: "Badges" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <ScanOverlay />
      <div className="relative z-10 h-full flex">
        {/* Left panel — identity */}
        <div className="w-72 h-full border-r border-v2-border p-6 flex flex-col items-center">
          <h1
            className="display-font text-xl tracking-[0.15em] mb-8 self-start"
            style={{
              color: "#e0e4ec",
              textShadow: "0 0 12px rgba(224, 228, 236, 0.15)",
            }}
          >
            Profile
          </h1>

          {/* Avatar placeholder */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
            style={{
              background: "rgba(224, 228, 236, 0.06)",
              border: "2px solid rgba(224, 228, 236, 0.15)",
            }}
          >
            <span className="text-4xl opacity-50">▲</span>
          </div>

          <div className="text-center mb-6">
            <div className="display-font text-sm tracking-wider text-v2-silver">
              Operator
            </div>
            <div className="text-xs text-v2-text-muted mt-1 telemetry-font">
              {profile?.streak ?? 0}d streak
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <GlowStat value={profile?.totalPoints ?? 0} label="XP" size="sm" />
            <GlowStat value={profile?.badges?.length ?? 0} label="Badges" size="sm" />
            <GlowStat value={profile?.streak ?? 0} label="Streak" size="sm" />
            <GlowStat
              value={`${Math.round(profile?.totalSessionMinutes ?? 0)}m`}
              label="Study"
              size="sm"
            />
          </div>
        </div>

        {/* Right panel — tabbed */}
        <div className="flex-1 h-full flex flex-col">
          {/* Tab bar */}
          <div className="flex border-b border-v2-border px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs tracking-wider uppercase transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? "border-v2-silver text-v2-silver"
                    : "border-transparent text-v2-text-muted hover:text-v2-text"
                }`}
                style={{ fontFamily: "'Chakra Petch', sans-serif" }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto scroll-container p-6">
            {activeTab === "stats" && (
              <div className="max-w-lg space-y-6">
                <HexPanel>
                  <h2 className="text-[10px] telemetry-font tracking-widest uppercase text-v2-text-muted mb-4">
                    Topic Mastery
                  </h2>
                  <div className="space-y-3">
                    {TOPICS.map((topic) => {
                      const progress = allProgress?.find((p) => p.topicId === topic.id);
                      return (
                        <TelemetryBar
                          key={topic.id}
                          value={progress?.masteryPercent ?? 0}
                          label={topic.name}
                          color={
                            (progress?.masteryPercent ?? 0) >= 85 ? "success" :
                            (progress?.masteryPercent ?? 0) >= 50 ? "cyan" : "warning"
                          }
                        />
                      );
                    })}
                  </div>
                </HexPanel>
              </div>
            )}

            {activeTab === "badges" && (
              <div className="max-w-lg">
                <HexPanel>
                  <h2 className="text-[10px] telemetry-font tracking-widest uppercase text-v2-text-muted mb-4">
                    Badges ({profile?.badges?.length ?? 0})
                  </h2>
                  {profile?.badges && profile.badges.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {profile.badges.map((badge) => (
                        <div
                          key={badge}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-lg"
                          style={{
                            background: "rgba(224, 228, 236, 0.04)",
                            border: "1px solid rgba(224, 228, 236, 0.1)",
                          }}
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-v2-silver/10">
                            <span className="text-lg">⬡</span>
                          </div>
                          <span className="text-[10px] text-v2-text-dim text-center">
                            {badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-v2-text-dim">
                      Complete activities to earn badges.
                    </p>
                  )}
                </HexPanel>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-lg space-y-4">
                <HexPanel>
                  <h2 className="text-[10px] telemetry-font tracking-widest uppercase text-v2-text-muted mb-4">
                    Sound
                  </h2>
                  <button
                    onClick={() => sound.toggle()}
                    className="px-4 py-2 text-xs rounded border border-v2-border text-v2-text
                      hover:border-v2-silver/30 transition-all"
                    style={{ fontFamily: "'Chakra Petch', sans-serif" }}
                  >
                    Sound: {sound.isEnabled() ? "ON" : "OFF"}
                  </button>
                </HexPanel>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
