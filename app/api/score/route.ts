import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export const runtime = "nodejs";

const SCORING_MODEL = process.env.SCORING_MODEL || "claude-sonnet-4-6";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

interface ScoreRequest {
  answers: Array<{
    question: string;
    expectedAnswer: string;
    userAnswer: string;
    topicId: string;
    tier: number;
  }>;
}

interface AnswerScore {
  technical: number;
  structure: number;
  ownership: number;
  feedback: string;
  missedTerms: string[];
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });
  }

  const { answers } = (await req.json()) as ScoreRequest;

  if (!answers || answers.length === 0) {
    return NextResponse.json({ error: "No answers provided" }, { status: 400 });
  }

  const scoringPrompt = answers
    .map(
      (a, i) =>
        `### Answer ${i + 1} — ${a.topicId} (Tier ${a.tier})
**Question:** ${a.question}

**Expected Answer:**
${a.expectedAnswer}

**User's Answer:**
${a.userAnswer || "(no answer given)"}`
    )
    .join("\n\n---\n\n");

  const response = await client.messages.create({
    model: SCORING_MODEL,
    max_tokens: 2048,
    system: `You are a technical interview scoring engine for data center operations, Linux systems, networking, and hardware topics.

Score each answer on three dimensions (1-5 each):
- **technical**: Accuracy and depth of technical content. Does the answer demonstrate real understanding, not just keyword recall? 1 = wrong/missing, 3 = partial, 5 = thorough and correct.
- **structure**: Is the answer organized and clear? Does it use a logical flow (e.g., steps, cause→effect)? 1 = rambling/no structure, 3 = okay, 5 = crisp and well-organized.
- **ownership**: Does the answer use first-person experience, concrete examples, or show confidence? 1 = vague/generic, 3 = adequate, 5 = clearly from experience with specific details.

Also identify key terms or concepts from the expected answer that the user missed (missedTerms — short phrases, max 8).

Provide a 1-2 sentence feedback note for each answer: what was strong, what to improve.

Respond with ONLY valid JSON — no markdown fences, no explanation outside the JSON:
{
  "scores": [
    {
      "technical": <1-5>,
      "structure": <1-5>,
      "ownership": <1-5>,
      "feedback": "<1-2 sentences>",
      "missedTerms": ["term1", "term2"]
    }
  ]
}`,
    messages: [
      {
        role: "user",
        content: `Score the following ${answers.length} interview answer(s):\n\n${scoringPrompt}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const parsed = JSON.parse(text) as { scores: AnswerScore[] };
    return NextResponse.json(parsed);
  } catch {
    // If Claude's response isn't valid JSON, return a fallback
    return NextResponse.json(
      { error: "Failed to parse scoring response", raw: text },
      { status: 502 }
    );
  }
}
