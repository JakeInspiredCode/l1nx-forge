// ═══════════════════════════════════════════════════════════════
// DOWNTIME SMASH — Scoring & Validation
// Pure functions for ticket answer matching and scoring
// ═══════════════════════════════════════════════════════════════

import { KeyTermEntry } from "@/lib/scenarios";
import { TicketDifficulty, TICKET_LEVELS } from "@/lib/ticket-scenarios";
import { TERMINAL_COMMANDS } from "@/lib/terminal-data";

// ── Command Matching ──

/** Check if user command matches any expected command (case-insensitive, trimmed) */
export function matchesExpectedCommand(
  userCmd: string,
  expected: string[],
  alternatives?: string[],
): boolean {
  const trimmed = userCmd.trim().toLowerCase();
  const all = [...expected, ...(alternatives ?? [])];
  return all.some((cmd) => trimmed === cmd.toLowerCase());
}

/**
 * Find the closest matching terminal command for a "close match" scenario.
 * Returns the matched key from TERMINAL_COMMANDS if the user typed a variant
 * of a known command (same base command, different flags).
 */
export function findCloseMatch(userCmd: string): string | null {
  const trimmed = userCmd.trim();
  if (TERMINAL_COMMANDS[trimmed]) return null; // exact match, not a close match
  const baseCmd = trimmed.split(" ")[0];
  return (
    Object.keys(TERMINAL_COMMANDS).find(
      (k) => k.split(" ")[0] === baseCmd && k !== trimmed,
    ) ?? null
  );
}

// ── Answer Normalization ──

/** Normalize answer for fuzzy comparison */
export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    // Normalize memory/storage units
    .replace(/\bgib?\b/gi, "g")
    .replace(/\btib?\b/gi, "t")
    .replace(/\bgbps?\b/gi, "gb/s")
    .replace(/\bmbps?\b/gi, "mb/s")
    // Strip trailing punctuation
    .replace(/[.,;:]+$/, "")
    // Strip approximate markers
    .replace(/^[~≈]/, "");
}

// ── Answer Scoring ──

export interface AnswerResult {
  score: number;
  matchedTerms: string[];
  totalTerms: number;
  feedback: string;
}

/** Score a user answer against expected answer and/or key terms */
export function scoreAnswer(
  userAnswer: string,
  expectedAnswer?: string,
  keyTerms?: KeyTermEntry[],
  acceptPatterns?: string[],
): AnswerResult {
  const normalUser = normalizeAnswer(userAnswer);

  // Try accept patterns first (regex)
  if (acceptPatterns?.length) {
    for (const pattern of acceptPatterns) {
      try {
        if (new RegExp(pattern, "i").test(userAnswer)) {
          return {
            score: 100,
            matchedTerms: [],
            totalTerms: 0,
            feedback: "Correct!",
          };
        }
      } catch {
        // Invalid regex, skip
      }
    }
  }

  // Try exact answer match
  if (expectedAnswer) {
    const normalExpected = normalizeAnswer(expectedAnswer);
    if (normalUser.includes(normalExpected) || normalExpected.includes(normalUser)) {
      return {
        score: 100,
        matchedTerms: [],
        totalTerms: 0,
        feedback: "Correct!",
      };
    }
  }

  // Key-term scoring
  if (keyTerms?.length) {
    const matched: string[] = [];
    for (const entry of keyTerms) {
      const allForms = [entry.term, ...(entry.synonyms ?? [])];
      const found = allForms.some((form) =>
        userAnswer.toLowerCase().includes(form.toLowerCase()),
      );
      if (found) matched.push(entry.term);
    }

    const score = Math.round((matched.length / keyTerms.length) * 100);
    const missed = keyTerms
      .filter((kt) => !matched.includes(kt.term))
      .map((kt) => kt.term);

    return {
      score,
      matchedTerms: matched,
      totalTerms: keyTerms.length,
      feedback:
        score === 100
          ? "All key terms matched!"
          : `Missed: ${missed.join(", ")}`,
    };
  }

  // Fallback: check if expected answer is partially in user answer
  if (expectedAnswer) {
    const words = normalizeAnswer(expectedAnswer).split(" ");
    const matched = words.filter((w) => normalUser.includes(w));
    const score = Math.round((matched.length / words.length) * 100);
    return {
      score: Math.min(score, 80), // cap partial matches at 80
      matchedTerms: matched,
      totalTerms: words.length,
      feedback: score >= 80 ? "Close!" : "Partially correct — review the explanation.",
    };
  }

  return { score: 0, matchedTerms: [], totalTerms: 0, feedback: "No answer expected." };
}

// ── Ticket Scoring ──

/** Compute final ticket score based on difficulty, commands, and answer */
export function computeTicketScore(
  difficulty: TicketDifficulty,
  commandsRun: string[],
  expectedCommands: string[],
  acceptAlternatives: string[] | undefined,
  answerScore: number,
): number {
  const level = TICKET_LEVELS[difficulty];

  // L0-L2: Binary — did you run the right command?
  if (level.order <= 2) {
    const ran = commandsRun.some((cmd) =>
      matchesExpectedCommand(cmd, expectedCommands, acceptAlternatives),
    );
    return ran ? 100 : 0;
  }

  // L3: Answer-only score
  if (level.order === 3) {
    return answerScore;
  }

  // L4-L5: 50% command coverage + 50% answer
  const allExpected = [...expectedCommands, ...(acceptAlternatives ?? [])];
  const commandCoverage =
    expectedCommands.length > 0
      ? expectedCommands.filter((ec) =>
          commandsRun.some(
            (cr) =>
              cr.toLowerCase() === ec.toLowerCase() ||
              (acceptAlternatives ?? []).some(
                (a) => cr.toLowerCase() === a.toLowerCase(),
              ),
          ),
        ).length / expectedCommands.length
      : 1;

  return Math.round(commandCoverage * 50 + (answerScore / 100) * 50);
}

/** Compute XP earned from a ticket */
export function computeXp(
  difficulty: TicketDifficulty,
  score: number,
  usedHint: boolean,
  usedReveal: boolean = false,
): number {
  const base = TICKET_LEVELS[difficulty].xpBase;
  let xp = Math.round(base * (score / 100));
  if (usedHint) xp = Math.round(xp * 0.5);
  if (usedReveal) xp = Math.round(xp * 0.5);
  return Math.max(xp, score > 0 ? 1 : 0);
}
