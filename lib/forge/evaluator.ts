// ═══════════════════════════════════════
// Answer Evaluator — Speed Run Engine
// ═══════════════════════════════════════

export type EvalScore = "correct" | "partial" | "wrong";

export interface EvalResult {
  score: EvalScore;
  feedback: string;
  needsSelfGrade: boolean;
}

// ── Command parsing ──

interface ParsedCommand {
  cmd: string;
  flags: string[];
  args: string[];
}

function parseCommand(input: string): ParsedCommand {
  const tokens = input.trim().split(/\s+/);
  const cmd = tokens[0] ?? "";
  const flags: string[] = [];
  const args: string[] = [];
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i].startsWith("-")) {
      // Split combined short flags: -la → -l -a
      if (tokens[i].length > 2 && !tokens[i].startsWith("--")) {
        for (const ch of tokens[i].slice(1)) flags.push(`-${ch}`);
      } else {
        flags.push(tokens[i]);
      }
    } else {
      args.push(tokens[i]);
    }
  }
  return { cmd, flags, args };
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function commandsMatch(userCmd: string, expectedCmd: string): boolean {
  if (userCmd === expectedCmd) return true;
  return levenshtein(userCmd.toLowerCase(), expectedCmd.toLowerCase()) <= 1;
}

export function evaluateCommand(userInput: string, expectedAnswer: string): EvalResult {
  const user = parseCommand(userInput);
  const expected = parseCommand(expectedAnswer);

  if (!commandsMatch(user.cmd, expected.cmd)) {
    return {
      score: "wrong",
      feedback: `Expected \`${expected.cmd}\`, got \`${user.cmd}\``,
      needsSelfGrade: false,
    };
  }

  // Check flags — order insensitive
  const missingFlags = expected.flags.filter((f) => !user.flags.includes(f));
  const extraFlags = user.flags.filter((f) => !expected.flags.includes(f));

  if (missingFlags.length === 0) {
    return { score: "correct", feedback: "Correct!", needsSelfGrade: false };
  }

  if (missingFlags.length <= Math.ceil(expected.flags.length / 2)) {
    return {
      score: "partial",
      feedback: `Missing: ${missingFlags.join(" ")}`,
      needsSelfGrade: false,
    };
  }

  return {
    score: "wrong",
    feedback: `Missing flags: ${missingFlags.join(" ")}`,
    needsSelfGrade: false,
  };
}

// ── Keyword evaluation ──

const SYNONYMS: Record<string, string[]> = {
  directory: ["folder", "dir"],
  remove: ["delete", "rm"],
  list: ["show", "display"],
  process: ["task"],
  network: ["networking", "net"],
  file: ["files"],
};

function normalize(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractKeywords(text: string): string[] {
  // Strip markdown, extract meaningful words
  const stripped = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[#*_\[\]]/g, " ");

  const words = stripped.split(/\s+/).map(normalize).filter((w) => w.length > 3);

  // Filter stop words
  const stopWords = new Set([
    "that", "this", "with", "from", "they", "have", "been", "will", "also",
    "more", "when", "used", "uses", "using", "which", "what", "than", "then",
    "each", "into", "over", "some", "such", "only", "both", "very", "well",
    "your", "their", "there", "where", "most", "many", "much", "like",
  ]);

  const unique = [...new Set(words.filter((w) => !stopWords.has(w)))];
  // Return top 5 by length (longer words tend to be more meaningful)
  return unique.sort((a, b) => b.length - a.length).slice(0, 5);
}

function wordMatchesKeyword(word: string, keyword: string): boolean {
  if (word === keyword) return true;
  const synonyms = SYNONYMS[keyword] ?? [];
  if (synonyms.includes(word)) return true;
  // Check reverse synonyms
  for (const [k, syns] of Object.entries(SYNONYMS)) {
    if (syns.includes(keyword) && (word === k || syns.includes(word))) return true;
  }
  return false;
}

export function evaluateKeywords(userInput: string, expectedAnswer: string): EvalResult {
  const keywords = extractKeywords(expectedAnswer);
  if (keywords.length === 0) {
    // Can't evaluate — need self-grade
    return { score: "wrong", feedback: "", needsSelfGrade: true };
  }

  const userWords = userInput.toLowerCase().split(/\s+/).map(normalize);
  const matched = keywords.filter((kw) =>
    userWords.some((w) => wordMatchesKeyword(w, kw))
  );
  const missed = keywords.filter((kw) => !matched.includes(kw));
  const ratio = matched.length / keywords.length;

  if (ratio >= 1.0) {
    return { score: "correct", feedback: "All key concepts covered!", needsSelfGrade: false };
  }
  if (ratio >= 0.5) {
    return {
      score: "partial",
      feedback: `Missing: ${missed.slice(0, 3).join(", ")}`,
      needsSelfGrade: false,
    };
  }
  return {
    score: "wrong",
    feedback: `Key concepts missed: ${missed.slice(0, 3).join(", ")}`,
    needsSelfGrade: false,
  };
}

// ── Main entry point ──

function isCommandCard(back: string): boolean {
  return back.includes("```") || /^\s*`[a-z]/.test(back) || /\b(sudo|grep|ls|df|ps|kill|find|chmod|systemctl|journalctl|cat|tail|head|awk|sed|curl|ping|ip |ssh|tar|mount|umount|fdisk|lsblk|dmesg|top|htop|free|uname|whoami|which|echo|export|cd |pwd|mkdir|rm |cp |mv )\b/.test(back);
}

function isLongProse(back: string): boolean {
  // Scenario cards with very long prose answers — best to self-grade
  const stripped = back.replace(/```[\s\S]*?```/g, "").replace(/`[^`]+`/g, "");
  return stripped.trim().split(/\s+/).length > 80;
}

export function evaluate(userInput: string, card: { back: string; type: string }): EvalResult {
  const trimmed = userInput.trim();

  if (!trimmed) {
    return { score: "wrong", feedback: "No answer provided.", needsSelfGrade: false };
  }

  if (isLongProse(card.back) || card.type === "scenario") {
    return { score: "wrong", feedback: "", needsSelfGrade: true };
  }

  if (isCommandCard(card.back)) {
    // Extract the primary command from the back field
    const codeMatch = card.back.match(/`([^`\n]+)`/) ?? card.back.match(/```[a-z]*\n?([^\n]+)/);
    const expectedCmd = codeMatch ? codeMatch[1].trim() : card.back.split("\n")[0].trim();
    return evaluateCommand(trimmed, expectedCmd);
  }

  return evaluateKeywords(trimmed, card.back);
}

// ── Points calculation ──

export function calcPoints(
  score: EvalScore,
  tier: number,
  comboMultiplier: number
): number {
  const base = score === "correct"
    ? [0, 10, 20, 30, 30][Math.min(tier, 3)]
    : score === "partial"
    ? [0, 5, 10, 15, 15][Math.min(tier, 3)]
    : 0;
  return Math.round(base * comboMultiplier);
}

export function getComboMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 6) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export function getTimeAdjustment(score: EvalScore, streak: number): number {
  if (score === "correct") return streak >= 3 ? 7 : 5;  // +2 streak bonus
  if (score === "partial") return 2;
  return -3;
}

// ── SM-2 quality mapping ──

export function scoreToSM2Quality(score: EvalScore): number {
  if (score === "correct") return 4;
  if (score === "partial") return 3;
  return 1;
}
