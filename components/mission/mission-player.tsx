"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Mission, MissionStep } from "@/lib/types/campaign";
import { XP, XP_MULTIPLIERS } from "@/lib/types/campaign";
import { getCampaign, getMissionsForCampaign } from "@/lib/seeds/campaigns";
import MissionBriefing from "./mission-briefing";
import LoadoutEditor from "./loadout-editor";
import KnowledgeCheckScreen from "./knowledge-check";
import MCKnowledgeCheck from "./mc-knowledge-check";
import MissionDebrief from "./mission-debrief";
import StepRenderer from "./step-renderer";
import { getMCQuestions } from "@/lib/seeds/knowledge-checks";
import TelemetryBar from "@/components/ui/telemetry-bar";
import ActionButton from "@/components/ui/action-button";

type Phase = "briefing" | "playing" | "knowledge-check" | "debrief";

interface MissionPlayerProps {
  mission: Mission;
}

export default function MissionPlayer({ mission }: MissionPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const completeMissionStep = useMutation(api.forgeMissions.completeMissionStep);
  const submitKnowledgeCheck = useMutation(api.forgeMissions.submitKnowledgeCheck);
  const updateMissionStatus = useMutation(api.forgeMissions.updateMissionStatus);
  const initMissionState = useMutation(api.forgeMissions.initMissionState);
  const advanceMission = useMutation(api.forgeCampaigns.advanceMission);
  const addPoints = useMutation(api.forgeProfile.addPoints);

  const [phase, setPhase] = useState<Phase>("briefing");
  const [loadout, setLoadout] = useState<MissionStep[]>(mission.defaultLoadout);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  const [showLoadoutEditor, setShowLoadoutEditor] = useState(
    searchParams.get("customize") === "true"
  );
  const [debriefData, setDebriefData] = useState<{
    passed: boolean;
    score: number;
    total: number;
    xpEarned: number;
  } | null>(null);

  const campaign = getCampaign(mission.campaignId);
  const currentStep = loadout[currentStepIndex];
  const stepProgress = loadout.length > 0 ? (stepsCompleted.length / loadout.length) * 100 : 0;

  const handleDeploy = useCallback(async () => {
    await initMissionState({ missionId: mission.id, status: "in-progress" });
    await updateMissionStatus({ missionId: mission.id, status: "in-progress" });
    setPhase("playing");
  }, [mission.id, initMissionState, updateMissionStatus]);

  const handleSkipToCheck = useCallback(async () => {
    await initMissionState({ missionId: mission.id, status: "in-progress" });
    await updateMissionStatus({ missionId: mission.id, status: "in-progress" });
    setPhase("knowledge-check");
  }, [mission.id, initMissionState, updateMissionStatus]);

  const handleStepComplete = useCallback(async () => {
    if (!currentStep) return;

    await completeMissionStep({ missionId: mission.id, stepId: currentStep.id });
    const newCompleted = [...stepsCompleted, currentStep.id];
    setStepsCompleted(newCompleted);

    // Award activity XP
    const activityXp = Math.round(
      XP.ACTIVITY_MIN + Math.random() * (XP.ACTIVITY_MAX - XP.ACTIVITY_MIN)
    );
    await addPoints({ points: activityXp });

    // Advance to next step or knowledge check
    if (currentStepIndex + 1 < loadout.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setPhase("knowledge-check");
    }
  }, [currentStep, currentStepIndex, loadout.length, mission.id, stepsCompleted, completeMissionStep, addPoints]);

  const handleSkipStep = useCallback(() => {
    if (currentStepIndex + 1 < loadout.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setPhase("knowledge-check");
    }
  }, [currentStepIndex, loadout.length]);

  const handleKnowledgeCheckComplete = useCallback(
    async (passed: boolean, score: number, total: number) => {
      let missionXp = 0;
      if (passed) {
        missionXp = Math.round(
          XP.MISSION_MIN + (score / total) * (XP.MISSION_MAX - XP.MISSION_MIN)
        );
        // First try bonus
        if (score === total) {
          missionXp = Math.round(missionXp * XP_MULTIPLIERS.PERFECT_SCORE);
        }

        await addPoints({ points: missionXp });

        // Advance campaign
        if (campaign) {
          await advanceMission({
            campaignId: campaign.id,
            completedMissionId: mission.id,
          });
        }
      }

      await submitKnowledgeCheck({
        missionId: mission.id,
        score: score / total,
        passed,
        xpEarned: missionXp,
      });

      setDebriefData({ passed, score, total, xpEarned: missionXp });
      setPhase("debrief");
    },
    [mission.id, campaign, addPoints, advanceMission, submitKnowledgeCheck]
  );

  const handleNextMission = useCallback(() => {
    if (!campaign) return;
    const campaignMissions = getMissionsForCampaign(campaign.id);
    const currentIdx = campaignMissions.findIndex((m) => m.id === mission.id);
    const next = campaignMissions[currentIdx + 1];
    if (next) {
      router.push(`/missions/${next.id}`);
    } else {
      router.push("/");
    }
  }, [campaign, mission.id, router]);

  const handleReturnToMap = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleRetry = useCallback(() => {
    setPhase("knowledge-check");
    setDebriefData(null);
  }, []);

  // ── Phase rendering ──

  if (phase === "briefing") {
    return (
      <>
        <MissionBriefing
          mission={mission}
          campaignTitle={campaign?.title}
          loadout={loadout}
          onDeploy={handleDeploy}
          onCustomize={() => setShowLoadoutEditor(true)}
          onSkipToCheck={handleSkipToCheck}
        />
        {showLoadoutEditor && (
          <LoadoutEditor
            steps={mission.defaultLoadout}
            onConfirm={(customLoadout) => {
              setLoadout(customLoadout);
              setShowLoadoutEditor(false);
            }}
            onCancel={() => setShowLoadoutEditor(false)}
          />
        )}
      </>
    );
  }

  if (phase === "playing") {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Step progress */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-v2-text-dim">
            Step {currentStepIndex + 1} of {loadout.length}
          </span>
          <span className="text-xs mono text-v2-text-dim">
            {stepsCompleted.length} completed
          </span>
        </div>
        <TelemetryBar value={stepProgress} segments={loadout.length} />

        {/* Current step */}
        {currentStep && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-v2-text-muted uppercase tracking-wider">
                  {currentStep.type}
                </p>
                <h2 className="text-base text-v2-text font-medium">
                  {currentStep.label}
                </h2>
              </div>
              <ActionButton variant="ghost" size="sm" onClick={handleSkipStep}>
                Skip →
              </ActionButton>
            </div>

            <StepRenderer
              step={currentStep}
              onStepComplete={handleStepComplete}
            />
          </div>
        )}
      </div>
    );
  }

  if (phase === "knowledge-check") {
    // Use multiple-choice questions if available for this mission, otherwise fall back to flashcard self-assessment
    const mcQuestions = getMCQuestions(mission.id);
    if (mcQuestions) {
      return (
        <MCKnowledgeCheck
          questions={mcQuestions}
          passThreshold={mission.knowledgeCheck.passThreshold}
          onComplete={handleKnowledgeCheckComplete}
        />
      );
    }
    return (
      <KnowledgeCheckScreen
        check={mission.knowledgeCheck}
        onComplete={handleKnowledgeCheckComplete}
      />
    );
  }

  if (phase === "debrief" && debriefData) {
    return (
      <MissionDebrief
        missionTitle={mission.title}
        passed={debriefData.passed}
        score={debriefData.score}
        total={debriefData.total}
        xpEarned={debriefData.xpEarned}
        onNextMission={campaign ? handleNextMission : undefined}
        onReturnToMap={handleReturnToMap}
        onRetry={!debriefData.passed ? handleRetry : undefined}
      />
    );
  }

  return null;
}
