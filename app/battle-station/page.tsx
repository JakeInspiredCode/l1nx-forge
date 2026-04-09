"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@/lib/convex-shim";
import { api } from "@/convex/_generated/api";
import StatusBadge from "@/components/ui/status-badge";
import ActionButton from "@/components/ui/action-button";
import TicketTerminal, { TicketAttemptResult } from "@/components/ticket-smash/ticket-terminal";
import {
  TICKET_SCENARIOS,
  TICKET_LEVELS,
  TICKET_DIFFICULTIES,
  TicketDifficulty,
  TicketScenario,
  getTicketsByDifficulty,
} from "@/lib/ticket-scenarios";

type Screen = "browse" | "playing";

export default function BattleStationPage() {
  const [screen, setScreen] = useState<Screen>("browse");
  const [activeQueue, setActiveQueue] = useState<TicketScenario[]>([]);
  const [activeQueueIdx, setActiveQueueIdx] = useState(0);
  const [activeDifficulty, setActiveDifficulty] = useState<TicketDifficulty>("orientation");

  // Key to force remount of TicketTerminal when advancing to next ticket
  const [terminalKey, setTerminalKey] = useState(0);
  const [randomMode, setRandomMode] = useState(false);
  const [randomTicket, setRandomTicket] = useState<TicketScenario | null>(null);

  const activeTicket = randomMode ? randomTicket : (activeQueue[activeQueueIdx] ?? null);

  // Convex hooks
  const ticketHistory = useQuery(api.forgeTicketHistory.getAll, {}) ?? [];
  const addHistory = useMutation(api.forgeTicketHistory.add);
  const addPoints = useMutation(api.forgeProfile.addPoints);
  const checkBadges = useMutation(api.forgeProfile.checkAndAwardBadges);

  // Stats
  const totalCompleted = new Set(ticketHistory.map((h: any) => h.ticketId)).size;
  const totalXp = ticketHistory.reduce((sum: number, h: any) => sum + (h.xpEarned ?? 0), 0);
  const avgScore = ticketHistory.length > 0
    ? Math.round(ticketHistory.reduce((sum: number, h: any) => sum + h.score, 0) / ticketHistory.length)
    : 0;

  // Best scores per ticket for completion indicators
  const bestScores = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of ticketHistory as any[]) {
      if (!map[h.ticketId] || h.score > map[h.ticketId]) {
        map[h.ticketId] = h.score;
      }
    }
    return map;
  }, [ticketHistory]);

  // Tickets for active difficulty
  const activeTickets = getTicketsByDifficulty(activeDifficulty);
  const completedInLevel = activeTickets.filter((t) => bestScores[t.id] !== undefined).length;

  const startTicket = (ticket: TicketScenario) => {
    // Build queue: from the clicked ticket to end of the level
    const idx = activeTickets.findIndex((t) => t.id === ticket.id);
    const queue = idx >= 0 ? activeTickets.slice(idx) : [ticket];
    setActiveQueue(queue);
    setActiveQueueIdx(0);
    setTerminalKey((k) => k + 1);
    setScreen("playing");
  };

  const pickRandom = (exclude?: string) => {
    const pool = activeTickets.filter((t) => t.id !== exclude);
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const startRandomMode = () => {
    const ticket = pickRandom();
    if (!ticket) return;
    setRandomMode(true);
    setRandomTicket(ticket);
    setTerminalKey((k) => k + 1);
    setScreen("playing");
  };

  const isLastInQueue = !randomMode && activeQueueIdx >= activeQueue.length - 1;

  const persistResult = async (result: TicketAttemptResult) => {
    try {
      await addHistory({
        ticketId: result.ticketId,
        difficulty: result.difficulty,
        score: result.score,
        commandsUsed: result.commandsUsed,
        answer: result.answer,
        usedHint: result.usedHint,
        xpEarned: result.xpEarned,
        timeMs: result.timeMs,
      });
      await addPoints({ points: result.xpEarned });
      await checkBadges({});
    } catch {
      // Silently handle
    }
  };

  const handleNext = async (result: TicketAttemptResult) => {
    await persistResult(result);
    if (randomMode) {
      // Pick another random ticket from the same level (avoid repeating the same one)
      const next = pickRandom(result.ticketId);
      setRandomTicket(next);
    } else {
      setActiveQueueIdx((i) => i + 1);
    }
    setTerminalKey((k) => k + 1);
  };

  const handleFinishSection = async (result: TicketAttemptResult) => {
    await persistResult(result);
    setScreen("browse");
  };

  // ── Playing screen ──
  if (screen === "playing" && activeTicket) {
    return (
      <div className="h-screen bg-v2-bg-deep flex flex-col">
        <TicketTerminal
          key={terminalKey}
          ticket={activeTicket}
          isLastInQueue={isLastInQueue}
          queuePosition={randomMode ? undefined : activeQueueIdx + 1}
          queueTotal={randomMode ? undefined : activeQueue.length}
          randomMode={randomMode}
          onComplete={isLastInQueue ? handleFinishSection : handleNext}
          onQuit={() => { setRandomMode(false); setScreen("browse"); }}
        />
      </div>
    );
  }

  // ── Browse screen ──
  return (
    <div className="min-h-screen bg-v2-bg-deep">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="display-font text-2xl tracking-[0.12em] mb-1"
            style={{ color: "#22c55e", textShadow: "0 0 12px rgba(34, 197, 94, 0.3)" }}
          >
            Downtime Smash
          </h1>
          <p className="text-sm text-v2-text-dim">
            Incoming threats detected — resolve before they take down the fleet
          </p>
        </div>

        {/* Stats bar */}
        {ticketHistory.length > 0 && (
          <div className="flex gap-4 mb-6 p-3 rounded-lg border border-v2-border bg-v2-bg-surface/50">
            <div className="text-center">
              <div className="text-lg font-bold mono text-v2-cyan">{totalCompleted}</div>
              <div className="text-[10px] text-v2-text-muted uppercase tracking-wider">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold mono text-v2-green">{avgScore}%</div>
              <div className="text-[10px] text-v2-text-muted uppercase tracking-wider">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold mono text-v2-warning">{totalXp}</div>
              <div className="text-[10px] text-v2-text-muted uppercase tracking-wider">Total XP</div>
            </div>
          </div>
        )}

        {/* Difficulty level tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TICKET_DIFFICULTIES.map((d) => {
            const info = TICKET_LEVELS[d];
            const tickets = getTicketsByDifficulty(d);
            const completed = tickets.filter((t) => bestScores[t.id] !== undefined).length;
            return (
              <button
                key={d}
                onClick={() => setActiveDifficulty(d)}
                className={`px-3 py-2 rounded-lg text-xs mono border transition-all duration-200 ${
                  activeDifficulty === d
                    ? "bg-v2-green/15 text-v2-green border-v2-green/40"
                    : "border-v2-border text-v2-text-dim hover:text-v2-text hover:border-v2-border/80"
                }`}
              >
                <div className="font-semibold">{info.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {completed}/{tickets.length}
                </div>
              </button>
            );
          })}
        </div>

        {/* Level info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StatusBadge
              label={TICKET_LEVELS[activeDifficulty].bloomsLevel}
              variant={TICKET_LEVELS[activeDifficulty].variant as any}
            />
            <span className="text-xs text-v2-text-muted">
              {TICKET_LEVELS[activeDifficulty].description}
            </span>
          </div>
          <ActionButton variant="primary" size="sm" onClick={startRandomMode}>
            Random Practice
          </ActionButton>
        </div>

        {/* Ticket list */}
        <div className="space-y-2">
          {activeTickets.map((ticket) => {
            const best = bestScores[ticket.id];
            const isDone = best !== undefined;
            return (
              <button
                key={ticket.id}
                onClick={() => startTicket(ticket)}
                className="w-full bg-v2-bg-surface border border-v2-border rounded-lg p-4 text-left hover:border-v2-green/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {/* Completion indicator */}
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isDone
                        ? best >= 80
                          ? "bg-v2-green/15 text-v2-green border border-v2-green/30"
                          : best >= 50
                          ? "bg-v2-warning/15 text-v2-warning border border-v2-warning/30"
                          : "bg-v2-danger/15 text-v2-danger border border-v2-danger/30"
                        : "border border-v2-border text-v2-text-muted"
                    }`}
                  >
                    {isDone ? (best >= 80 ? "✓" : best + "%") : "○"}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-v2-text group-hover:text-v2-green transition-colors truncate">
                        {ticket.title}
                      </span>
                      <StatusBadge label={ticket.category} variant="muted" />
                    </div>
                    <p className="text-xs text-v2-text-dim line-clamp-1 mt-0.5">
                      {ticket.ticket.split("\n")[0]}
                    </p>
                  </div>

                  {/* XP */}
                  <span className="text-[10px] mono text-v2-text-muted flex-shrink-0">
                    {ticket.xpReward} XP
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {activeTickets.length === 0 && (
          <div className="text-center py-12 text-v2-text-dim text-sm">
            No tickets at this difficulty level.
          </div>
        )}
      </main>
    </div>
  );
}
