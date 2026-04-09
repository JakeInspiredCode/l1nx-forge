"use client";

import { useState } from "react";
import StatusBadge from "@/components/ui/status-badge";
import ActionButton from "@/components/ui/action-button";
import { TicketScenario, TICKET_LEVELS, TicketDifficulty } from "@/lib/ticket-scenarios";

// ── Types ──

export interface TicketResult {
  score: number;
  matchedTerms: string[];
  totalTerms: number;
  xpEarned: number;
  feedback: string;
}

interface TicketPanelProps {
  ticket: TicketScenario;
  commandsRun: string[];
  commandsMatched: string[];
  phase: "working" | "answer" | "result";
  onSubmitAnswer: (answer: string) => void;
  onRequestHint: () => void;
  onNextTicket: () => void;
  onReadyToAnswer: () => void;
  showHint: boolean;
  result?: TicketResult;
  currentStep?: number;
  totalSteps?: number;
}

// ── Component ──

export default function TicketPanel({
  ticket,
  commandsRun,
  commandsMatched,
  phase,
  onSubmitAnswer,
  onRequestHint,
  onNextTicket,
  onReadyToAnswer,
  showHint,
  result,
  currentStep,
  totalSteps,
}: TicketPanelProps) {
  const [answerText, setAnswerText] = useState("");
  const [showWhy, setShowWhy] = useState(false);
  const level = TICKET_LEVELS[ticket.difficulty];
  const isCommandLevel = level.order <= 2;
  const needsAnswer = !!ticket.answerPrompt;

  // For multi-step tickets, get the current step's prompt
  const stepPrompt = ticket.steps && currentStep !== undefined && currentStep < ticket.steps.length
    ? ticket.steps[currentStep]
    : null;

  const answerPrompt = stepPrompt?.answerPrompt ?? ticket.answerPrompt;

  return (
    <div className="h-full flex flex-col rounded-lg border border-v2-border bg-v2-bg-surface overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-v2-border shrink-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <StatusBadge label={level.label} variant={level.variant as any} />
          <StatusBadge label={ticket.category} variant="muted" />
          {totalSteps && currentStep !== undefined && (
            <span className="text-[10px] mono text-v2-text-muted">
              Step {currentStep + 1}/{totalSteps}
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-v2-text">{ticket.title}</h3>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {phase === "working" && (
          <>
            {/* Ticket body */}
            <div className="text-xs text-v2-text-dim leading-relaxed whitespace-pre-wrap">
              {stepPrompt ? stepPrompt.prompt : ticket.ticket}
            </div>

            {/* Why this matters */}
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="text-[10px] text-v2-cyan hover:text-v2-cyan/80 transition-colors flex items-center gap-1"
            >
              <span className={`transition-transform ${showWhy ? "rotate-90" : ""}`}>▸</span>
              Why this matters
            </button>
            {showWhy && (
              <div className="text-[11px] text-v2-text-muted leading-relaxed p-2 rounded bg-v2-bg-elevated/50 border-l-2 border-v2-cyan/20">
                {ticket.why}
              </div>
            )}

            {/* Command tracking for L0-L2 */}
            {isCommandLevel && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-v2-text-muted">Expected command</span>
                {ticket.expectedCommands.map((cmd) => {
                  const done = commandsMatched.some(
                    (m) => m.toLowerCase() === cmd.toLowerCase(),
                  );
                  return (
                    <div
                      key={cmd}
                      className={`flex items-center gap-2 p-1.5 rounded text-xs ${
                        done ? "bg-v2-cyan/5" : ""
                      }`}
                    >
                      <span className={done ? "text-v2-cyan" : "text-v2-text-muted"}>
                        {done ? "✓" : "○"}
                      </span>
                      <code className={`text-[11px] ${done ? "text-v2-cyan/60 line-through" : "text-v2-cyan"}`}>
                        {cmd}
                      </code>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Command tracker for L4-L5 */}
            {!isCommandLevel && level.order >= 4 && (
              <div className="text-[10px] text-v2-text-muted">
                Commands used: {commandsRun.length}
              </div>
            )}

            {/* Ready to answer button for L3+ */}
            {needsAnswer && !isCommandLevel && (
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={onReadyToAnswer}
                className="w-full"
              >
                Ready to answer
              </ActionButton>
            )}

            {/* Hint */}
            {ticket.hint && (
              <>
                {!showHint ? (
                  <button
                    onClick={onRequestHint}
                    className="text-[10px] text-v2-text-muted hover:text-v2-warning transition-colors"
                  >
                    Need a hint? (costs 50% XP)
                  </button>
                ) : (
                  <div className="text-[11px] text-v2-warning/80 leading-relaxed p-2 rounded bg-v2-warning/5 border-l-2 border-v2-warning/30">
                    {ticket.hint}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {phase === "answer" && (
          <div className="space-y-3">
            <div className="text-xs text-v2-text-dim leading-relaxed">
              {answerPrompt}
            </div>
            <input
              type="text"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && answerText.trim()) {
                  onSubmitAnswer(answerText.trim());
                  setAnswerText("");
                }
              }}
              placeholder="Type your answer..."
              autoFocus
              className="w-full bg-v2-bg-elevated border border-v2-border rounded px-3 py-2 text-sm text-v2-text placeholder:text-v2-text-muted focus:border-v2-cyan/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <ActionButton
                variant="primary"
                size="sm"
                onClick={() => {
                  if (answerText.trim()) {
                    onSubmitAnswer(answerText.trim());
                    setAnswerText("");
                  }
                }}
                className="flex-1"
              >
                Submit
              </ActionButton>
              <ActionButton
                variant="ghost"
                size="sm"
                onClick={onReadyToAnswer}
              >
                Back
              </ActionButton>
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <div className="space-y-3">
            {/* Score */}
            <div className="text-center py-2">
              <div
                className={`text-3xl font-bold mono ${
                  result.score >= 80
                    ? "text-v2-green"
                    : result.score >= 50
                    ? "text-v2-warning"
                    : "text-v2-danger"
                }`}
              >
                {result.score}%
              </div>
              <div className="text-xs text-v2-text-muted mt-1">{result.feedback}</div>
            </div>

            {/* XP earned */}
            <div className="flex items-center justify-center gap-2 py-1">
              <span className="text-xs text-v2-cyan font-semibold">+{result.xpEarned} XP</span>
            </div>

            {/* Key terms breakdown for L4-L5 */}
            {result.totalTerms > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-v2-text-muted">
                  Key terms ({result.matchedTerms.length}/{result.totalTerms})
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.matchedTerms.map((term) => (
                    <span key={term} className="text-[10px] px-1.5 py-0.5 rounded bg-v2-green/10 text-v2-green border border-v2-green/20">
                      ✓ {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="p-2 rounded bg-v2-bg-elevated/50 border-l-2 border-v2-cyan/20">
              <span className="text-[10px] uppercase tracking-wider text-v2-text-muted block mb-1">
                Explanation
              </span>
              <p className="text-[11px] text-v2-text-dim leading-relaxed">
                {ticket.explanation}
              </p>
            </div>

            {/* Next button */}
            <ActionButton variant="primary" onClick={onNextTicket} className="w-full">
              Next Ticket
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
