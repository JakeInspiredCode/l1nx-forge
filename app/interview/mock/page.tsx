"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useMutation } from "@/lib/convex-shim";
import { api } from "../../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ForgeCard, TOPICS, mapConvexCard, Quality } from "@/lib/types";
import { useCards, useAllProgress } from "@/lib/convex-hooks";
import { sm2, sortByPriority } from "@/lib/sm2";

type InterviewState = "setup" | "active" | "scoring" | "review";

interface AnswerEntry {
  card: ForgeCard;
  answer: string;
  score?: { technical: number; structure: number; ownership: number; feedback: string; missedTerms: string[] };
}

export default function InterviewPage() {
  const [state, setState] = useState<InterviewState>("setup");
  const [interviewType, setInterviewType] = useState("full-mix");
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState<ForgeCard[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timer, setTimer] = useState(0);
  const [thinkTimer, setThinkTimer] = useState(30);
  const [showQuestion, setShowQuestion] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save answers to sessionStorage on change (debounced)
  useEffect(() => {
    if (state !== "active") return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem("l1nx-interview-autosave", JSON.stringify({
          answers, currentAnswer, currentQ, timer, questions: questions.map((q) => q.id),
        }));
      } catch { /* storage full — ignore */ }
    }, 1000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [currentAnswer, answers, currentQ, timer, state, questions]);

  const addSession = useMutation(api.forgeSessions.add);
  const updateCard = useMutation(api.forgeCards.updateCard);
  const recomputeProgress = useMutation(api.forgeProgressRecompute.recompute);
  const recordSession = useMutation(api.forgeProfile.recordSessionComplete);
  const checkBadges = useMutation(api.forgeProfile.checkAndAwardBadges);
  const rawCards = useCards();
  const progress = useAllProgress();

  const cards = useMemo(() => rawCards.map(mapConvexCard), [rawCards]);

  useEffect(() => {
    if (state === "active") {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 0) { clearInterval(intervalRef.current!); finishInterview(); return 0; } // eslint-disable-line
          return t - 1;
        });
        if (showQuestion) setThinkTimer((t) => Math.max(0, t - 1));
      }, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [state, showQuestion]);

  const startInterview = () => {
    let pool = cards.filter((c) => {
      const tp = progress.find((p) => p.topicId === c.topicId);
      return tp ? c.tier <= tp.currentTier : c.tier === 1;
    });
    if (interviewType === "linux-technical") pool = pool.filter((c) => c.topicId === "linux");
    else if (interviewType === "behavioral") pool = pool.filter((c) => c.topicId === "behavioral");
    else if (interviewType === "dc-ops") pool = pool.filter((c) =>
      ["hardware", "networking", "fiber", "power-cooling", "ops-processes"].includes(c.topicId));

    const weakTopics = progress.filter((p) => p.weakFlag).map((p) => p.topicId);
    const sorted = sortByPriority(pool);
    const weighted = [
      ...sorted.filter((c) => weakTopics.includes(c.topicId)).slice(0, 4),
      ...sorted.filter((c) => !weakTopics.includes(c.topicId)),
    ];
    const selected: ForgeCard[] = [];
    const seen = new Set<string>();
    for (const card of weighted) {
      if (selected.length >= 8) break;
      if (!seen.has(card.id)) { seen.add(card.id); selected.push(card); }
    }
    setQuestions(selected); setTimer(timeLimit * 60);
    setCurrentQ(0); setAnswers([]); setCurrentAnswer("");
    setThinkTimer(30); setShowQuestion(true); setState("active");
  };

  const submitAnswer = () => {
    const entry: AnswerEntry = { card: questions[currentQ], answer: currentAnswer };
    const newAnswers = [...answers, entry];
    setAnswers(newAnswers); setCurrentAnswer(""); setThinkTimer(30); setShowQuestion(true);
    if (currentQ + 1 < questions.length) setCurrentQ(currentQ + 1);
    else finishInterview(newAnswers);
  };

  const finishInterview = async (finalAnswers?: AnswerEntry[]) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const toScore = finalAnswers ?? answers;
    setState("scoring");

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: toScore.map((a) => ({
            question: a.card.front,
            expectedAnswer: a.card.back,
            userAnswer: a.answer,
            topicId: a.card.topicId,
            tier: a.card.tier,
          })),
        }),
      });

      let scored: AnswerEntry[];
      if (res.ok) {
        const { scores } = await res.json();
        scored = toScore.map((a, i) => ({
          ...a,
          score: scores[i] ?? { technical: 0, structure: 0, ownership: 0, feedback: "Scoring unavailable.", missedTerms: [] },
        }));
      } else {
        // Fallback: zero scores with error note
        scored = toScore.map((a) => ({
          ...a,
          score: { technical: 0, structure: 0, ownership: 0, feedback: "AI scoring failed — check your ANTHROPIC_API_KEY.", missedTerms: [] },
        }));
      }
      setAnswers(scored);

      await addSession({
        type: "mock-interview",
        startTime: new Date(Date.now() - timeLimit * 60000).toISOString(),
        endTime: new Date().toISOString(),
        cardIds: questions.map((q) => q.id),
        answers: scored.map((a) => ({
          cardId: a.card.id, transcript: a.answer,
          rubricScores: a.score ? { technical: a.score.technical, structure: a.score.structure, ownership: a.score.ownership } : { technical: 0, structure: 0, ownership: 0 },
          missedTerms: a.score?.missedTerms ?? [],
        })),
        overallScore: scored.length > 0
          ? Math.round(scored.reduce((s, a) => s + (a.score?.technical ?? 0) + (a.score?.structure ?? 0) + (a.score?.ownership ?? 0), 0) / (scored.length * 3))
          : undefined,
      });

      // Update SM-2 state for each answered card based on rubric scores
      const today = new Date().toISOString().split("T")[0];
      const affectedTopics = new Set<string>();
      for (const a of scored) {
        if (!a.score) continue;
        const avg = (a.score.technical + a.score.structure + a.score.ownership) / 3;
        let quality: Quality;
        if (avg < 1) quality = 0;
        else if (avg < 2) quality = 2;
        else if (avg < 3) quality = 3;
        else if (avg < 4) quality = 4;
        else quality = 5;
        const sm2Result = sm2(a.card, quality, 0);
        await updateCard({ cardId: a.card.id, ...sm2Result, lastReview: today });
        affectedTopics.add(a.card.topicId);
      }
      for (const topicId of affectedTopics) {
        await recomputeProgress({ topicId });
      }
      await recordSession({ sessionMinutes: timeLimit });
      await checkBadges({});

      setState("review");
    } catch {
      // Network error — still show review with zero scores
      const scored = toScore.map((a) => ({
        ...a,
        score: { technical: 0, structure: 0, ownership: 0, feedback: "Scoring request failed — check network.", missedTerms: [] },
      }));
      setAnswers(scored);
      setState("review");
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (state === "scoring") {
    return (
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="mt-16">
            <div className="text-4xl mb-4 animate-pulse">AI</div>
            <h2 className="text-xl font-semibold mono mb-2">Scoring your answers...</h2>
            <p className="text-forge-text-dim text-sm">Claude is evaluating {answers.length} answer{answers.length !== 1 ? "s" : ""} for technical accuracy, structure, and depth.</p>
          </div>
        </main>
    );
  }

  if (state === "setup") {
    return (
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold mb-6 mono">Mock Interview</h1>
          <div className="space-y-4">
            <div className="bg-forge-surface border border-forge-border rounded-xl p-5">
              <label className="block text-sm font-medium mb-3">Interview Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: "full-mix", label: "Full Mix" }, { value: "linux-technical", label: "Linux Technical" },
                  { value: "dc-ops", label: "General DC Ops" }, { value: "behavioral", label: "Behavioral" }
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setInterviewType(opt.value)}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      interviewType === opt.value ? "border-forge-accent bg-forge-accent/10 text-forge-accent" : "border-forge-border hover:border-forge-border-hover"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-forge-surface border border-forge-border rounded-xl p-5">
              <label className="block text-sm font-medium mb-3">Time Limit</label>
              <div className="flex gap-2">
                {[15, 30, 45].map((t) => (
                  <button key={t} onClick={() => setTimeLimit(t)}
                    className={`flex-1 p-3 rounded-lg border text-sm mono transition-colors ${
                      timeLimit === t ? "border-forge-accent bg-forge-accent/10 text-forge-accent" : "border-forge-border hover:border-forge-border-hover"}`}>
                    {t} min
                  </button>
                ))}
              </div>
            </div>
            <button onClick={startInterview}
              className="w-full py-4 bg-forge-accent text-white rounded-xl font-semibold text-lg hover:bg-forge-accent/90 transition-colors">
              Start Interview
            </button>
          </div>
        </main>
    );
  }

  // ACTIVE
  if (state === "active" && questions[currentQ]) {
    const q = questions[currentQ];
    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-forge-text-dim mono">Q{currentQ + 1}/{questions.length}</span>
            <span className={`text-lg mono font-bold ${
              timer <= 10 ? "text-forge-danger animate-pulse" :
              timer <= 30 ? "text-forge-danger" :
              timer <= 60 ? "text-forge-warning" :
              "text-forge-accent"
            }`}>
              {formatTime(timer)}
              {timer <= 60 && timer > 0 && <span className="text-xs ml-1">{timer <= 10 ? "!!!" : timer <= 30 ? "!!" : "!"}</span>}
            </span>
            <button onClick={() => finishInterview()} className="text-xs text-forge-danger hover:text-forge-danger/80">End Early</button>
          </div>
          <div className="bg-forge-surface border border-forge-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs mono text-forge-text-muted">{q.topicId} — T{q.tier}</span>
              {thinkTimer > 0 && <span className="text-xs mono text-forge-warning">Think: {thinkTimer}s</span>}
            </div>
            <div className="markdown-content text-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.front}</ReactMarkdown>
            </div>
          </div>
          <textarea value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-48 bg-forge-surface-2 border border-forge-border rounded-xl p-4 text-sm resize-none focus:border-forge-accent focus:outline-none" />
          <button onClick={submitAnswer} disabled={currentAnswer.trim().length === 0}
            className="mt-4 w-full py-3 bg-forge-accent text-white rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-forge-accent/90 transition-colors">
            Submit Answer
          </button>
        </main>
    );
  }

  // REVIEW
  if (state === "review") {
    const avgScore = answers.length > 0
      ? Math.round(answers.reduce((s, a) => s + (a.score?.technical ?? 0) + (a.score?.structure ?? 0) + (a.score?.ownership ?? 0), 0) / (answers.length * 3) * 20)
      : 0;
    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold mb-2 mono">Interview Review</h1>
          <p className="text-forge-text-dim mb-6">
            Overall: <span className={`mono font-bold ${avgScore >= 70 ? "text-forge-success" : avgScore >= 50 ? "text-forge-warning" : "text-forge-danger"}`}>{avgScore}%</span>
          </p>
          <div className="space-y-4">
            {answers.map((a, i) => (
              <div key={i} className="bg-forge-surface border border-forge-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs mono text-forge-text-muted">Q{i + 1} — {a.card.topicId}</span>
                  {a.score && (
                    <div className="flex gap-3 text-xs mono">
                      <span>Tech: <span className="text-forge-accent">{a.score.technical}/5</span></span>
                      <span>Struct: <span className="text-forge-accent">{a.score.structure}/5</span></span>
                      <span>Own: <span className="text-forge-accent">{a.score.ownership}/5</span></span>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium mb-2">{a.card.front}</p>
                <div className="bg-forge-surface-2 rounded-lg p-3 mb-3">
                  <span className="text-xs text-forge-text-dim block mb-1">Your answer:</span>
                  <p className="text-sm">{a.answer || "(no answer)"}</p>
                </div>
                <details className="text-sm">
                  <summary className="text-forge-accent cursor-pointer text-xs">Show expected answer</summary>
                  <div className="mt-2 markdown-content text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.card.back}</ReactMarkdown>
                  </div>
                </details>
                {a.score?.feedback && <p className="text-xs text-forge-text-dim mt-2">{a.score.feedback}</p>}
                {a.score?.missedTerms && a.score.missedTerms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs text-forge-text-muted">Missed:</span>
                    {a.score.missedTerms.map((term, j) => (
                      <span key={j} className="text-xs bg-forge-danger/10 text-forge-danger/80 px-1.5 py-0.5 rounded">{term}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={() => setState("setup")}
            className="mt-6 w-full py-3 bg-forge-accent/20 text-forge-accent border border-forge-accent/30 rounded-xl font-medium hover:bg-forge-accent/30 transition-colors">
            New Interview
          </button>
        </main>
    );
  }

  return null;
}
