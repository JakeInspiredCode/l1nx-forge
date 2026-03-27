import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export const runtime = "nodejs";

function buildSystemPrompt(context: AgentContext, mode: string): string {
  const { profile, progress, weakTopics, dueCount, totalCards, masteredCards, strugglingCards, recentSessions } = context;

  const progressSummary = progress
    .map((p) => `  - ${p.topicId}: ${p.masteryPercent.toFixed(0)}% mastery, Tier ${p.currentTier}, ${p.weakFlag ? "⚠ WEAK" : "OK"}`)
    .join("\n");

  const weakList = weakTopics.length > 0 ? weakTopics.join(", ") : "none";

  const strugglingList = strugglingCards
    .slice(0, 8)
    .map((c) => `  - [${c.topicId} T${c.tier}] "${c.front}" (ease: ${c.easeFactor.toFixed(2)})`)
    .join("\n");

  const interviewHistory = recentSessions
    .filter((s) => s.type === "mock-interview" && s.enrichedAnswers?.length > 0)
    .slice(0, 2)
    .map((s, i) => {
      const qaList = s.enrichedAnswers
        .map((a: { question: string; transcript: string; rubricScores: { technical: number; structure: number; ownership: number }; missedTerms: string[] }) =>
          `    Q: ${a.question}\n    A: ${a.transcript}\n    Scores — Tech: ${a.rubricScores.technical}/5, Structure: ${a.rubricScores.structure}/5, Ownership: ${a.rubricScores.ownership}/5\n    Missed: ${a.missedTerms.join(", ") || "none"}`
        )
        .join("\n\n");
      return `  Session ${i + 1} (${s.startTime?.slice(0, 10)}):\n${qaList}`;
    })
    .join("\n\n");

  const modeInstructions: Record<string, string> = {
    coach: `You are in COACH mode. Have a natural conversation. Analyze the user's weak areas, suggest what to study next, explain concepts they're struggling with, and give strategic interview prep advice. Be direct and specific — reference their actual data.`,
    quiz: `You are in QUIZ mode. Pick one of the user's weak or due cards and quiz them on it. Present the question clearly, wait for their answer, then evaluate it thoroughly — not just keyword matching but real comprehension. Give detailed feedback, correct misconceptions, and then move to the next card. Track which cards you've covered in this session.`,
    "mock-interview": `You are in MOCK INTERVIEW mode. You are a senior technical interviewer. Ask interview questions one at a time — start with a mix of their weak topics. After each answer, probe with follow-up questions if the answer is vague or incomplete. Score their answer on technical accuracy, structure, and use of concrete examples. Give feedback after each question before moving to the next. Be realistic but encouraging.`,
  };

  return `You are the L1NX Forge AI Coach — a sharp, knowledgeable interview prep assistant embedded in a spaced-repetition study app. You have full context of the user's study history, mastery levels, and past interview performance.

## Your Personality
- Direct and honest — don't sugarcoat weak performance, but stay constructive
- Technical depth — you understand the subject matter (Linux, data center ops, networking, hardware, xAI/Colossus)
- Strategic — you think about interview prep holistically, not just flashcard recall
- Memory — you remember what the user has told you in this conversation and reference it naturally

## Current Mode
${modeInstructions[mode] ?? modeInstructions.coach}

## User's Study State (as of today)
- Total cards: ${totalCards} | Mastered: ${masteredCards} | Due for review: ${dueCount}
- Streak: ${profile?.streak ?? 0} days | Total points: ${profile?.totalPoints ?? 0}
- Badges earned: ${profile?.badges?.join(", ") || "none yet"}

### Topic Mastery
${progressSummary}

### Weak Topics (mastery < 85%)
${weakList}

### Cards the user struggles with most (lowest ease factor)
${strugglingList || "  None identified yet — keep studying!"}

### Recent Mock Interview History
${interviewHistory || "  No mock interviews completed yet."}

## Instructions
- Reference specific data from above when giving advice (e.g., "Your Linux mastery is only 62% — that's likely to come up in the interview")
- In quiz/mock-interview mode, draw from the struggling cards and weak topics above
- When the user answers a question, evaluate the substance of their answer, not just keywords
- Keep responses focused and actionable — no unnecessary padding
- If asked about a concept, teach it thoroughly with examples relevant to data center / SRE / xAI context`;
}

type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

type AgentContext = {
  profile: { streak: number; totalPoints: number; badges: string[] } | null;
  progress: Array<{ topicId: string; masteryPercent: number; currentTier: number; weakFlag: boolean }>;
  weakTopics: string[];
  dueCount: number;
  totalCards: number;
  masteredCards: number;
  dueCards: Array<{ cardId: string; topicId: string; front: string; easeFactor: number; interval: number; repetitions: number; tier: number }>;
  strugglingCards: Array<{ cardId: string; topicId: string; front: string; back: string; easeFactor: number; interval: number; tier: number }>;
  recentReviews: Array<{ cardId: string; quality: number; timestamp: string; responseTime: number }>;
  recentSessions: Array<{ type: string; startTime: string; enrichedAnswers: Array<{ question: string; transcript: string; rubricScores: { technical: number; structure: number; ownership: number }; missedTerms: string[] }> }>;
};

const ALLOWED_MODELS = new Set([
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
  "claude-opus-4-6",
]);

export async function POST(req: NextRequest) {
  try {
    const { messages, context, mode, model } = (await req.json()) as {
      messages: AgentMessage[];
      context: AgentContext;
      mode: string;
      model?: string;
    };

    const systemPrompt = buildSystemPrompt(context, mode);
    const resolvedModel = model && ALLOWED_MODELS.has(model) ? model : "claude-sonnet-4-6";

    const stream = await client.messages.stream({
      model: resolvedModel,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (streamErr) {
          controller.enqueue(encoder.encode(`[stream error: ${(streamErr as Error).message}]`));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[agent route]", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
