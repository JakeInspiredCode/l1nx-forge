"use client";

import { useEffect, useRef } from "react";
import { PersonalityType, PERSONALITY_META } from "@/lib/mascot/types";

interface MascotSettingsProps {
  personality: PersonalityType;
  muted: boolean;
  onChange: (p: PersonalityType) => void;
  onToggleMute: () => void;
  onClose: () => void;
}

const PERSONALITIES = Object.entries(PERSONALITY_META) as [PersonalityType, typeof PERSONALITY_META[PersonalityType]][];

export default function MascotSettings({ personality, muted, onChange, onToggleMute, onClose }: MascotSettingsProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // Delay to prevent the opening click from immediately closing
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-14 right-0 w-56 bg-forge-surface border border-forge-border rounded-xl shadow-2xl p-3 z-50"
    >
      <p className="text-[10px] mono text-forge-text-dim uppercase tracking-widest mb-2">Mascot Personality</p>

      <div className="space-y-1.5">
        {PERSONALITIES.map(([id, meta]) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full text-left px-2.5 py-2 rounded-lg border text-xs transition-colors ${
              personality === id
                ? "border-forge-accent/40 bg-forge-accent/15 text-forge-accent"
                : "border-forge-border bg-transparent text-forge-text-dim hover:border-forge-border-hover hover:text-forge-text"
            }`}
          >
            <span className="font-medium block">{meta.name}</span>
            <span className="text-[10px] opacity-60">{meta.description}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-forge-border">
        <button
          onClick={onToggleMute}
          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-forge-text-dim hover:text-forge-text transition-colors flex items-center gap-2"
        >
          <span className="mono">{muted ? "[ ]" : "[x]"}</span>
          <span>{muted ? "Unmute mascot" : "Mute mascot"}</span>
        </button>
      </div>
    </div>
  );
}
