"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Nav from "@/components/nav";
import HexPanel from "@/components/ui/hex-panel";
import GlowStat from "@/components/ui/glow-stat";
import TelemetryBar from "@/components/ui/telemetry-bar";
import ScanOverlay from "@/components/ui/scan-overlay";
import { TOPICS } from "@/lib/types";

export default function ProfilePage() {
  const profile = useQuery(api.forgeProfile.get);
  const allProgress = useQuery(api.forgeProgress.getAll);

  return (
    <>
      <Nav />
      <main className="relative min-h-screen bg-v2-bg-deep">
        <ScanOverlay />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 space-y-6">
          <h1 className="display-font text-xl text-v2-cyan tracking-widest">Profile</h1>

          {/* Stats */}
          <HexPanel glow>
            <div className="flex items-center justify-around py-2">
              <GlowStat value={profile?.totalPoints ?? 0} label="Total XP" />
              <GlowStat value={profile?.streak ?? 0} label="Streak" icon="🔥" />
              <GlowStat value={profile?.badges?.length ?? 0} label="Badges" />
              <GlowStat
                value={`${Math.round(profile?.totalSessionMinutes ?? 0)}m`}
                label="Study Time"
              />
            </div>
          </HexPanel>

          {/* Topic Mastery */}
          <HexPanel>
            <h2 className="text-xs text-v2-text-muted uppercase tracking-wider mb-3">
              Topic Mastery
            </h2>
            <div className="space-y-3">
              {TOPICS.map((topic) => {
                const progress = allProgress?.find(
                  (p) => p.topicId === topic.id
                );
                return (
                  <TelemetryBar
                    key={topic.id}
                    value={progress?.masteryPercent ?? 0}
                    label={topic.name}
                    color={
                      (progress?.masteryPercent ?? 0) >= 85
                        ? "success"
                        : (progress?.masteryPercent ?? 0) >= 50
                        ? "cyan"
                        : "warning"
                    }
                  />
                );
              })}
            </div>
          </HexPanel>

          {/* Badges */}
          <HexPanel>
            <h2 className="text-xs text-v2-text-muted uppercase tracking-wider mb-3">
              Badges ({profile?.badges?.length ?? 0})
            </h2>
            {profile?.badges && profile.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge) => (
                  <span
                    key={badge}
                    className="px-2 py-1 text-xs bg-v2-cyan/10 text-v2-cyan border border-v2-cyan/30 rounded"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-v2-text-dim">
                Complete activities to earn badges.
              </p>
            )}
          </HexPanel>
        </div>
      </main>
    </>
  );
}
