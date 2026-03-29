"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import AgentChat from "@/components/agent-chat";
import Link from "next/link";

function generateThreadId(): string {
  return `coach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Default thread ID — used on first visit before any conversations exist
const DEFAULT_THREAD_ID = "coach-main";

export default function CoachPage() {
  const progress = useQuery(api.forgeProgress.getAll);
  const profile = useQuery(api.forgeProfile.get);
  const [showHistory, setShowHistory] = useState(false);
  const recentThreads = useQuery(api.forgeConversations.getRecent, { limit: 10 });
  const deleteThread = useMutation(api.forgeConversations.deleteThread);

  // Active thread — defaults to most recent thread or the legacy default
  const [activeThreadId, setActiveThreadId] = useState<string>(DEFAULT_THREAD_ID);
  const autoResetDone = useRef(false);

  // Auto-reset: if the most recent thread's last message is older than 4 hours, start fresh
  useEffect(() => {
    if (autoResetDone.current || !recentThreads) return;
    autoResetDone.current = true;

    const mostRecent = recentThreads[0];
    if (!mostRecent || mostRecent.messages.length === 0) return;

    const lastMsg = mostRecent.messages[mostRecent.messages.length - 1];
    const lastTime = new Date(lastMsg.timestamp).getTime();
    const hoursSince = (Date.now() - lastTime) / (1000 * 60 * 60);

    if (hoursSince >= 4) {
      // Stale session — auto-start a new thread
      setActiveThreadId(generateThreadId());
    } else {
      // Resume the most recent thread
      setActiveThreadId(mostRecent.threadId);
    }
  }, [recentThreads]);

  const handleNewConversation = useCallback(() => {
    setActiveThreadId(generateThreadId());
  }, []);

  const handleLoadThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
  }, []);

  const handleDeleteThread = useCallback(async (threadId: string) => {
    await deleteThread({ threadId });
    // If the deleted thread was active, start a new one
    if (threadId === activeThreadId) {
      setActiveThreadId(generateThreadId());
    }
  }, [deleteThread, activeThreadId]);

  const weakTopics = progress?.filter((p) => p.weakFlag) ?? [];
  const overallMastery =
    progress && progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.masteryPercent, 0) / progress.length)
      : 0;

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4 shrink-0">
        <Link
          href="/"
          className="text-forge-text/40 hover:text-forge-text/70 text-sm transition-colors"
        >
          ← Dashboard
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-forge-text font-mono">
            AI Coach
          </h1>
          <p className="text-xs text-forge-text/40">
            Powered by Claude — knows your full study history
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-forge-text/40 hover:text-forge-text/60 border border-white/10 rounded px-3 py-1.5 transition-colors"
        >
          History
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — mastery snapshot */}
        <aside className="w-64 border-r border-white/10 p-4 shrink-0 hidden lg:flex flex-col gap-4 overflow-y-auto">
          <div>
            <div className="text-xs font-mono text-forge-text/40 uppercase tracking-wider mb-3">
              Your Status
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-2xl font-bold text-forge-accent font-mono">
                {overallMastery}%
              </div>
              <div className="text-xs text-forge-text/50">Overall Mastery</div>
              <div className="mt-2 flex gap-3 text-xs text-forge-text/40">
                <span>🔥 {profile?.streak ?? 0}d streak</span>
                <span>⭐ {profile?.totalPoints ?? 0} pts</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-forge-text/40 uppercase tracking-wider mb-3">
              Topic Mastery
            </div>
            <div className="space-y-2">
              {progress?.map((p) => (
                <div key={p.topicId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`capitalize ${p.weakFlag ? "text-forge-warning" : "text-forge-text/60"}`}>
                      {p.weakFlag ? "⚠ " : ""}{p.topicId.replace("-", " ")}
                    </span>
                    <span className="text-forge-text/40 font-mono">
                      {p.masteryPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        p.masteryPercent >= 85 ? "bg-forge-success" :
                        p.masteryPercent >= 60 ? "bg-forge-accent" :
                        "bg-forge-warning"
                      }`}
                      style={{ width: `${p.masteryPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {weakTopics.length > 0 && (
            <div className="bg-forge-warning/10 border border-forge-warning/20 rounded-lg p-3">
              <div className="text-xs font-mono text-forge-warning mb-1">Weak Areas</div>
              <div className="text-xs text-forge-text/60 space-y-0.5">
                {weakTopics.map((t) => (
                  <div key={t.topicId}>• {t.topicId.replace("-", " ")}</div>
                ))}
              </div>
              <div className="text-xs text-forge-text/40 mt-2">
                Ask your coach to focus here
              </div>
            </div>
          )}
        </aside>

        {/* Main chat area */}
        <main className="flex-1 min-h-0 flex flex-col">
          <AgentChat
            key={activeThreadId}
            threadId={activeThreadId}
            onNewConversation={handleNewConversation}
          />
        </main>

        {/* History panel */}
        {showHistory && (
          <aside className="w-56 border-l border-white/10 p-4 shrink-0 hidden xl:flex flex-col gap-2 overflow-y-auto">
            <div className="text-xs font-mono text-forge-text/40 uppercase tracking-wider mb-2">
              Recent Threads
            </div>
            {recentThreads?.map((t) => {
              const isActive = t.threadId === activeThreadId;
              const preview = t.messages.find((m: { role: string }) => m.role === "user")?.content?.slice(0, 60) || "No messages";
              return (
                <div
                  key={t.threadId}
                  className={`text-xs border rounded p-2 transition-colors group ${
                    isActive
                      ? "text-forge-accent border-forge-accent/40 bg-forge-accent/5"
                      : "text-forge-text/50 border-white/10 hover:border-white/20 cursor-pointer"
                  }`}
                  onClick={() => !isActive && handleLoadThread(t.threadId)}
                >
                  <div className="flex justify-between items-start">
                    <div className="capitalize font-medium text-forge-text/70">{t.mode}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(t.threadId);
                      }}
                      className="text-forge-text/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                      title="Delete thread"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-forge-text/40 mt-0.5 truncate">{preview}</div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-forge-text/30">{t.messages.length} msgs</span>
                    <span className="text-forge-text/25">{t.updatedAt?.slice(0, 10)}</span>
                  </div>
                </div>
              );
            })}
            {(!recentThreads || recentThreads.length === 0) && (
              <div className="text-xs text-forge-text/30">No prior sessions</div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
