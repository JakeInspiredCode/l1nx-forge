import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export const runtime = "nodejs";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

const PERSONALITY_TONES: Record<string, string> = {
  "drill-sergeant": `Your tone is that of a tough, no-nonsense drill sergeant. Be blunt, demanding, and direct. Push the user hard. Use military-style motivation. Don't coddle — if they're slacking, call it out. But when they earn it, give respect.`,
  "cheerleader": `Your tone is that of an enthusiastic, high-energy cheerleader. Celebrate every win, big or small. Use exclamation marks, encouragement, and hype. Stay positive even when pointing out weaknesses — frame everything as an opportunity to grow.`,
  "zen-master": `Your tone is that of a calm, wise zen master. Speak with measured wisdom and patience. Use metaphors and philosophical framing. Be accepting of mistakes as part of the journey. Guide rather than push. Keep responses thoughtful and unhurried.`,
  "sarcastic-friend": `Your tone is that of a witty, sarcastic friend who genuinely cares. Use dry humor, light roasts, and playful jabs — but always with real support underneath. Be honest and casual. Don't take yourself too seriously.`,
};

function buildSystemPrompt(context: AgentContext, personality?: string): string {
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

  return `You are the L1NX Forge AI Agent — a sharp, knowledgeable interview prep assistant embedded in a spaced-repetition study app. You have full context of the user's study history, mastery levels, and past interview performance.

## Your Personality
${personality && PERSONALITY_TONES[personality] ? PERSONALITY_TONES[personality] : PERSONALITY_TONES["sarcastic-friend"]}
- Technical depth — you understand the subject matter (Linux, data center ops, networking, hardware, xAI/Colossus)
- Strategic — you think about interview prep holistically, not just flashcard recall
- Versatile — you can coach, quiz, mock-interview, explain concepts, or just chat. Follow the user's lead.
- Memory — you remember what the user has told you in this conversation and reference it naturally

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
- When the user asks to be quizzed, draw from the struggling cards and weak topics above
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

const MAX_CONTEXT_TOKENS = 180_000;
const SYSTEM_PROMPT_BUDGET = 10_000;
const MAX_TOKENS_RESPONSE = 4096;
const MESSAGE_TOKEN_BUDGET = MAX_CONTEXT_TOKENS - SYSTEM_PROMPT_BUDGET - MAX_TOKENS_RESPONSE;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function windowMessages(messages: AgentMessage[]): { messages: AgentMessage[]; inputTokens: number; trimmed: boolean } {
  let totalTokens = 0;
  for (const m of messages) {
    totalTokens += estimateTokens(m.content);
  }

  if (totalTokens <= MESSAGE_TOKEN_BUDGET) {
    return { messages, inputTokens: totalTokens, trimmed: false };
  }

  const kept: AgentMessage[] = [];
  let budget = MESSAGE_TOKEN_BUDGET;
  for (let i = messages.length - 1; i >= 0; i--) {
    const cost = estimateTokens(messages[i].content);
    if (cost > budget) break;
    budget -= cost;
    kept.unshift(messages[i]);
  }

  if (kept.length < messages.length) {
    kept.unshift({
      role: "user",
      content: "[Earlier conversation history was trimmed to fit context limits.]",
    });
  }

  return { messages: kept, inputTokens: MESSAGE_TOKEN_BUDGET - budget, trimmed: true };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, context, model, personality } = (await req.json()) as {
      messages: AgentMessage[];
      context: AgentContext;
      model?: string;
      personality?: string;
    };

    const systemPrompt = buildSystemPrompt(context, personality);
    const resolvedModel = model && ALLOWED_MODELS.has(model) ? model : "claude-sonnet-4-6";
    const { messages: windowedMessages, inputTokens, trimmed } = windowMessages(messages);

    const stream = await client.messages.stream({
      model: resolvedModel,
      max_tokens: MAX_TOKENS_RESPONSE,
      system: systemPrompt,
      messages: windowedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    let outputTokens = 0;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const text = chunk.delta.text;
              outputTokens += estimateTokens(text);
              controller.enqueue(encoder.encode(text));
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
        "X-Input-Tokens": String(inputTokens),
        "X-Trimmed": String(trimmed),
        "X-Model": resolvedModel,
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
