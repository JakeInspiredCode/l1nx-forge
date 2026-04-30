"use client";

import type { Mission } from "@/lib/types/campaign";
import { STEP_TYPE_ICONS } from "@/lib/constants/mission";

interface MissionLoadoutEditorProps {
  mission: Mission;
  enabled: Record<string, boolean>;
  onToggle: (stepId: string, required: boolean) => void;
}

export default function MissionLoadoutEditor({
  mission,
  enabled,
  onToggle,
}: MissionLoadoutEditorProps) {
  return (
    <div className="space-y-1">
      {mission.defaultLoadout.map((step) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onToggle(step.id, step.required)}
          className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-[11px] text-left transition-colors ${
            enabled[step.id] ? "bg-v2-bg-elevated/40" : "opacity-40"
          } ${step.required ? "cursor-default" : "cursor-pointer hover:bg-v2-bg-elevated/60"}`}
        >
          <div
            className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
              step.required
                ? "border-v2-text-muted/40 bg-v2-cyan/10"
                : enabled[step.id]
                ? "border-v2-cyan/60 bg-v2-cyan/15"
                : "border-v2-border"
            }`}
          >
            {(enabled[step.id] || step.required) && (
              <span className="text-v2-cyan text-[10px]">✓</span>
            )}
          </div>

          <span className="text-[10px] w-4 text-center">
            {STEP_TYPE_ICONS[step.type] ?? "•"}
          </span>
          <span className="text-[#c8d6e5] flex-1 truncate">{step.label}</span>
          <span className="text-[10px] telemetry-font text-[#8eafc8]">
            {step.estimatedMinutes}m
          </span>
          {step.required && (
            <span className="text-[10px] telemetry-font text-[#8eafc8] opacity-50">
              REQ
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
