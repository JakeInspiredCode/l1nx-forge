"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { MissionStep } from "@/lib/types/campaign";
import { mapConvexCard } from "@/lib/types";
import { getAllModules } from "@/lib/seeds/quick-draw-modules";
import { getScenarioById } from "@/lib/seeds/diagnosis-scenarios";
import { SCENARIOS } from "@/lib/scenarios";
import ActionButton from "@/components/ui/action-button";
import HexPanel from "@/components/ui/hex-panel";

// Lazy imports for heavy components
import dynamic from "next/dynamic";
const CardQueue = dynamic(() => import("@/components/card-queue"), { ssr: false });
const QuickDrawGame = dynamic(() => import("@/components/forge/quick-draw/quick-draw-game"), { ssr: false });
const DiagnosisGame = dynamic(() => import("@/components/forge/diagnosis/diagnosis-game"), { ssr: false });
const DrillWalkthrough = dynamic(() => import("@/components/drill-walkthrough"), { ssr: false });
const LinuxFoundations = dynamic(() => import("@/components/linux-foundations"), { ssr: false });
const BootLearn = dynamic(() => import("@/components/forge/boot-process/boot-learn"), { ssr: false });
const BootTriage = dynamic(() => import("@/components/forge/boot-process/boot-triage"), { ssr: false });
const TerminalSim = dynamic(() => import("@/components/terminal-sim"), { ssr: false });
const FilesystemGame = dynamic(() => import("@/components/forge/explorer/filesystem-game"), { ssr: false });

interface StepRendererProps {
  step: MissionStep;
  onStepComplete: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Card Set Step ──
function CardSetStep({ step, onStepComplete }: StepRendererProps) {
  const params = step.contentRef.params as { topicId?: string; tier?: number; count?: number } | undefined;
  const topicId = params?.topicId ?? "linux";
  const tier = params?.tier ?? 1;
  const count = params?.count ?? 8;

  const rawCards = useQuery(api.forgeCards.getByTopicTier, { topicId, tier });

  const cards = useMemo(() => {
    if (!rawCards || rawCards.length === 0) return [];
    return shuffle(rawCards).slice(0, count).map(mapConvexCard);
  }, [rawCards, count]);

  if (!rawCards) {
    return <LoadingStep />;
  }

  if (cards.length === 0) {
    return <FallbackStep label="No cards found for this topic/tier" onComplete={onStepComplete} />;
  }

  return <CardQueue cards={cards} sessionType="topic-drill" onComplete={onStepComplete} />;
}

// ── Quick Draw Step ──
function QuickDrawStep({ step, onStepComplete }: StepRendererProps) {
  const moduleId = step.contentRef.id;
  const modules = getAllModules();
  const mod = modules.find((m) => m.id === moduleId);

  if (!mod) {
    return <FallbackStep label={`Quick Draw module "${moduleId}" not found`} onComplete={onStepComplete} />;
  }

  return (
    <QuickDrawGame
      items={mod.items}
      mode="type"
      onComplete={() => onStepComplete()}
      onQuit={() => onStepComplete()}
    />
  );
}

// ── Diagnosis Step ──
function DiagnosisStep({ step, onStepComplete }: StepRendererProps) {
  const scenarioId = step.contentRef.id;
  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    return <FallbackStep label={`Diagnosis scenario "${scenarioId}" not found`} onComplete={onStepComplete} />;
  }

  return (
    <DiagnosisGame
      scenario={scenario}
      onComplete={() => onStepComplete()}
      onQuit={() => onStepComplete()}
    />
  );
}

// ── Drill Step ──
function DrillStep({ step, onStepComplete }: StepRendererProps) {
  const scenarioId = step.contentRef.id;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);

  if (!scenario) {
    return <FallbackStep label={`Drill scenario "${scenarioId}" not found`} onComplete={onStepComplete} />;
  }

  return <DrillWalkthrough scenario={scenario} onComplete={onStepComplete} />;
}

// ── Reading Step (Foundations) ──
function ReadingStep({ step, onStepComplete }: StepRendererProps) {
  const sectionId = Number(step.contentRef.id);

  return (
    <div className="relative">
      <LinuxFoundations initialSection={sectionId} />
      <div className="sticky bottom-4 flex justify-center pt-4">
        <ActionButton variant="primary" size="lg" onClick={onStepComplete}>
          Done Reading
        </ActionButton>
      </div>
    </div>
  );
}

// ── Boot Process Step ──
function BootStep({ step, onStepComplete }: StepRendererProps) {
  if (step.contentRef.id === "triage") {
    return <BootTriage onBack={onStepComplete} />;
  }
  return <BootLearn onBack={onStepComplete} />;
}

// ── Terminal Step ──
function TerminalStep({ onStepComplete }: { onStepComplete: () => void }) {
  return (
    <div>
      <TerminalSim height={300} />
      <div className="flex justify-center pt-4">
        <ActionButton variant="primary" onClick={onStepComplete}>
          Done Practicing
        </ActionButton>
      </div>
    </div>
  );
}

// ── Explorer Step ──
function ExplorerStep({ step, onStepComplete }: StepRendererProps) {
  const mode = (step.contentRef.id === "label" ? "label" : "learn") as "learn" | "label";
  return <FilesystemGame mode={mode} onBack={onStepComplete} />;
}

// ── Helpers ──

function LoadingStep() {
  return (
    <HexPanel>
      <div className="py-8 text-center text-v2-text-dim text-sm">Loading activity...</div>
    </HexPanel>
  );
}

function FallbackStep({ label, onComplete }: { label: string; onComplete: () => void }) {
  return (
    <HexPanel>
      <div className="py-8 text-center">
        <p className="text-v2-text-muted text-sm mb-4">{label}</p>
        <ActionButton variant="secondary" onClick={onComplete}>
          Continue
        </ActionButton>
      </div>
    </HexPanel>
  );
}

// ── Main Renderer ──

export default function StepRenderer({ step, onStepComplete }: StepRendererProps) {
  switch (step.contentRef.kind) {
    case "foundation-section":
      return <ReadingStep step={step} onStepComplete={onStepComplete} />;
    case "card-set":
      return <CardSetStep step={step} onStepComplete={onStepComplete} />;
    case "quick-draw-module":
      return <QuickDrawStep step={step} onStepComplete={onStepComplete} />;
    case "diagnosis-scenario":
      return <DiagnosisStep step={step} onStepComplete={onStepComplete} />;
    case "drill-scenario":
      return <DrillStep step={step} onStepComplete={onStepComplete} />;
    case "boot-process":
      return <BootStep step={step} onStepComplete={onStepComplete} />;
    case "terminal-exercise":
      return <TerminalStep onStepComplete={onStepComplete} />;
    case "explorer":
      return <ExplorerStep step={step} onStepComplete={onStepComplete} />;
    default:
      return <FallbackStep label={`Unknown activity: ${step.contentRef.kind}`} onComplete={onStepComplete} />;
  }
}
