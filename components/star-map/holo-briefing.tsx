"use client";

import { useEffect, useState, useRef } from "react";
import type { Mission, MissionStatus } from "@/lib/types/campaign";
import { STEP_TYPE_ICONS } from "@/lib/constants/mission";
import { useSoundEngine } from "@/lib/sound-engine";

interface HoloBriefingProps {
  mission: Mission;
  campaignTitle: string;
  missionNumber: number;
  totalMissions: number;
  status: MissionStatus;
  onDeploy: (missionId: string) => void;
  onDismiss: () => void;
}

export default function HoloBriefing({
  mission,
  campaignTitle,
  missionNumber,
  totalMissions,
  status,
  onDeploy,
  onDismiss,
}: HoloBriefingProps) {
  const [mounted, setMounted] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const sound = useSoundEngine();

  useEffect(() => {
    setMounted(true);

    // Close on Escape
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDismiss]);

  // Parallax mouse tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setMouseOffset({
        x: (e.clientX - cx) * 0.008,
        y: (e.clientY - cy) * 0.008,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const handleDeploy = () => {
    sound.play("deploy");
    setTimeout(() => onDeploy(mission.id), 300);
  };

  const loadout = mission.defaultLoadout ?? [];
  const knowledgeCheck = mission.knowledgeCheck;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[64] transition-opacity duration-300"
        style={{
          background: "rgba(5, 5, 8, 0.7)",
          backdropFilter: "blur(3px)",
          opacity: mounted ? 1 : 0,
        }}
        onClick={onDismiss}
      />

      {/* Holographic panel — outer wrapper handles centering, inner handles animation */}
      <div
        className="fixed z-[65] inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          ref={panelRef}
          className={`w-[90vw] max-w-[560px] pointer-events-auto ${mounted ? "holo-enter" : ""}`}
          style={{
            transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
          }}
        >
        <div className="holo-panel holo-corners rounded-lg overflow-hidden">
          {/* Scan line sweep on entry */}
          {mounted && (
            <div
              className="absolute left-0 right-0 h-[2px] pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(6, 214, 214, 0.4), transparent)",
                animation: "holoScanline 0.6s ease-out forwards",
                top: "-10%",
              }}
            />
          )}

          <div className="relative p-6 space-y-5" style={{ transform: `translate(${mouseOffset.x * 0.3}px, ${mouseOffset.y * 0.3}px)` }}>
            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-v2-text-dim hover:text-v2-cyan transition-colors rounded"
              aria-label="Close briefing"
            >
              ✕
            </button>

            {/* Campaign tag */}
            <div className="text-[10px] telemetry-font tracking-widest uppercase text-v2-text-muted">
              {campaignTitle} — Mission {missionNumber}
            </div>

            {/* Mission title */}
            <h2
              className="display-font text-xl tracking-wider"
              style={{
                color: "#06d6d6",
                textShadow: "0 0 16px rgba(6, 214, 214, 0.4), 0 0 40px rgba(6, 214, 214, 0.15)",
              }}
            >
              {mission.title}
            </h2>

            {/* Objective */}
            <p className="text-sm text-v2-text leading-relaxed">
              {mission.description}
            </p>

            {/* Default loadout */}
            {loadout.length > 0 && (
              <div>
                <h3 className="text-[10px] telemetry-font tracking-widest uppercase text-v2-text-muted mb-2">
                  Default Loadout
                </h3>
                <div className="space-y-1.5">
                  {loadout.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded"
                      style={{
                        background: "rgba(15, 17, 24, 0.5)",
                        border: "1px solid rgba(30, 34, 51, 0.4)",
                      }}
                    >
                      <span className="text-sm">
                        {STEP_TYPE_ICONS[step.type] ?? "📄"}
                      </span>
                      <span className="text-xs text-v2-text flex-1 truncate">
                        {step.label}
                      </span>
                      <span className="text-[10px] telemetry-font text-v2-text-muted">
                        {step.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge check info */}
            {knowledgeCheck && (
              <div className="flex items-center gap-2 text-xs text-v2-text-dim">
                <span className="text-v2-cyan">◆</span>
                <span>
                  Pass {Math.round(knowledgeCheck.passThreshold * 100)}% of {knowledgeCheck.items.length} items to claim this system
                </span>
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onDismiss}
                className="text-xs text-v2-text-muted hover:text-v2-text transition-colors"
              >
                Dismiss
              </button>

              {(status === "available" || status === "in-progress" || status === "decaying") && (
                <button onClick={handleDeploy} className="deploy-btn">
                  Deploy
                </button>
              )}

              {status === "accomplished" && (
                <button
                  onClick={() => onDeploy(mission.id)}
                  className="px-6 py-2.5 text-sm font-semibold rounded tracking-wider uppercase
                    bg-v2-cyan/10 text-v2-cyan border border-v2-cyan/30
                    hover:bg-v2-cyan/20 transition-all"
                  style={{ fontFamily: "'Chakra Petch', sans-serif" }}
                >
                  Review
                </button>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
