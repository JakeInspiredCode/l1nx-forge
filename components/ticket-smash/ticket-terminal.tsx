"use client";

import { useState, useCallback, useRef } from "react";
import TerminalSim from "@/components/terminal-sim";
import TicketPanel, { TicketResult } from "@/components/ticket-smash/ticket-panel";
import ActionButton from "@/components/ui/action-button";
import { TicketScenario, TICKET_LEVELS } from "@/lib/ticket-scenarios";
import {
  matchesExpectedCommand,
  scoreAnswer,
  computeTicketScore,
  computeXp,
} from "@/lib/ticket-scoring";

// ── Types ──

export interface TicketAttemptResult {
  ticketId: string;
  difficulty: string;
  score: number;
  commandsUsed: string[];
  answer: string;
  usedHint: boolean;
  xpEarned: number;
  timeMs: number;
}

interface TicketTerminalProps {
  ticket: TicketScenario;
  onComplete: (result: TicketAttemptResult) => void;
  onQuit: () => void;
}

// ── Component ──

export default function TicketTerminal({ ticket, onComplete, onQuit }: TicketTerminalProps) {
  const [commandsRun, setCommandsRun] = useState<string[]>([]);
  const [commandsMatched, setCommandsMatched] = useState<string[]>([]);
  const [phase, setPhase] = useState<"working" | "answer" | "result">("working");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<TicketResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const startTime = useRef(Date.now());

  const level = TICKET_LEVELS[ticket.difficulty];
  const isCommandLevel = level.order <= 2;
  const isMultiStep = !!ticket.steps?.length;
  const totalSteps = ticket.steps?.length ?? 0;

  // Get the currently active step for multi-step tickets
  const activeStep = isMultiStep && ticket.steps ? ticket.steps[currentStep] : null;

  // Which commands count as "expected" for the current step/ticket
  const currentExpected = activeStep?.expectedCommands ?? ticket.expectedCommands;
  const currentAlternatives = activeStep?.acceptAlternatives ?? ticket.acceptAlternatives;

  const handleCommand = useCallback(
    (cmd: string, resolvedCmd?: string) => {
      // Track all commands
      setCommandsRun((prev) => [...prev, cmd]);

      // The resolved command (from close-match) counts for matching
      const effectiveCmd = resolvedCmd ?? cmd;

      // Check if this command matches expected
      if (matchesExpectedCommand(effectiveCmd, currentExpected, currentAlternatives)) {
        setCommandsMatched((prev) => [...prev, effectiveCmd]);
      }
      // Also check the original typed command
      if (resolvedCmd && matchesExpectedCommand(cmd, currentExpected, currentAlternatives)) {
        setCommandsMatched((prev) => [...prev, cmd]);
      }

      // L0-L2: auto-complete when correct command is run
      if (isCommandLevel) {
        const isMatch =
          matchesExpectedCommand(effectiveCmd, currentExpected, currentAlternatives) ||
          matchesExpectedCommand(cmd, currentExpected, currentAlternatives);
        if (isMatch) {
          const score = 100;
          const xp = computeXp(ticket.difficulty, score, showHint);
          const res: TicketResult = {
            score,
            matchedTerms: [],
            totalTerms: 0,
            xpEarned: xp,
            feedback: "Command executed correctly!",
          };
          setResult(res);
          setPhase("result");
        }
      }
    },
    [currentExpected, currentAlternatives, isCommandLevel, showHint, ticket.difficulty],
  );

  const handleReadyToAnswer = useCallback(() => {
    setPhase((prev) => (prev === "answer" ? "working" : "answer"));
  }, []);

  const handleSubmitAnswer = useCallback(
    (answer: string) => {
      setUserAnswer(answer);

      // For multi-step: check current step
      if (isMultiStep && activeStep) {
        const stepResult = scoreAnswer(
          answer,
          activeStep.expectedAnswer,
          activeStep.answerKeyTerms,
        );

        // If there are more steps, advance
        if (currentStep < totalSteps - 1) {
          setCurrentStep((prev) => prev + 1);
          setPhase("working");
          return;
        }

        // Last step or final answer — check the ticket-level answer
        if (ticket.answerPrompt) {
          // We're on the last step but there's a final ticket-level answer
          const finalResult = scoreAnswer(
            answer,
            ticket.expectedAnswer,
            ticket.answerKeyTerms,
            ticket.answerAcceptPatterns,
          );
          const finalScore = computeTicketScore(
            ticket.difficulty,
            commandsRun,
            ticket.expectedCommands,
            ticket.acceptAlternatives,
            finalResult.score,
          );
          const xp = computeXp(ticket.difficulty, finalScore, showHint);
          setResult({
            score: finalScore,
            matchedTerms: finalResult.matchedTerms,
            totalTerms: finalResult.totalTerms,
            xpEarned: xp,
            feedback: finalResult.feedback,
          });
          setPhase("result");
          return;
        }
      }

      // Non-multi-step or no further steps
      const answerResult = scoreAnswer(
        answer,
        ticket.expectedAnswer,
        ticket.answerKeyTerms,
        ticket.answerAcceptPatterns,
      );

      const finalScore = computeTicketScore(
        ticket.difficulty,
        commandsRun,
        ticket.expectedCommands,
        ticket.acceptAlternatives,
        answerResult.score,
      );

      const xp = computeXp(ticket.difficulty, finalScore, showHint);

      setResult({
        score: finalScore,
        matchedTerms: answerResult.matchedTerms,
        totalTerms: answerResult.totalTerms,
        xpEarned: xp,
        feedback: answerResult.feedback,
      });
      setPhase("result");
    },
    [
      isMultiStep,
      activeStep,
      currentStep,
      totalSteps,
      ticket,
      commandsRun,
      showHint,
    ],
  );

  const handleNext = useCallback(() => {
    if (!result) return;
    onComplete({
      ticketId: ticket.id,
      difficulty: ticket.difficulty,
      score: result.score,
      commandsUsed: commandsRun,
      answer: userAnswer,
      usedHint: showHint,
      xpEarned: result.xpEarned,
      timeMs: Date.now() - startTime.current,
    });
  }, [result, ticket, commandsRun, userAnswer, showHint, onComplete]);

  return (
    <div className="flex flex-col h-full">
      {/* Quit button */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <span className="text-xs mono text-v2-text-muted">
          {ticket.id} — {level.label}
        </span>
        <ActionButton variant="ghost" size="sm" onClick={onQuit}>
          ✕ Quit
        </ActionButton>
      </div>

      {/* Main layout: terminal + panel */}
      <div className="flex gap-3 flex-1 min-h-0 px-4 pb-4">
        {/* Terminal — left 60% */}
        <div className="flex-[3] min-w-0">
          <TerminalSim height={480} onCommand={handleCommand} />
        </div>

        {/* Panel — right 40% */}
        <div className="flex-[2] min-w-0" style={{ minHeight: 520 }}>
          <TicketPanel
            ticket={ticket}
            commandsRun={commandsRun}
            commandsMatched={commandsMatched}
            phase={phase}
            onSubmitAnswer={handleSubmitAnswer}
            onRequestHint={() => setShowHint(true)}
            onNextTicket={handleNext}
            onReadyToAnswer={handleReadyToAnswer}
            showHint={showHint}
            result={result ?? undefined}
            currentStep={isMultiStep ? currentStep : undefined}
            totalSteps={isMultiStep ? totalSteps : undefined}
          />
        </div>
      </div>
    </div>
  );
}
