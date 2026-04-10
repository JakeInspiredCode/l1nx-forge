"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@/lib/convex-shim";
import { api } from "@/convex/_generated/api";
import AgentChat from "@/components/agent-chat";
import {
  PersonalityType,
  PERSONALITY_META,
  PERSONALITY_STORAGE_KEY,
  MUTED_STORAGE_KEY,
} from "@/lib/mascot/types";

function generateThreadId(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

export default function AgentPage() {
  const recentThreads = useQuery(api.forgeConversations.getRecent, { limit: 50 });
  const deleteThread = useMutation(api.forgeConversations.deleteThread);
  const renameThread = useMutation(api.forgeConversations.renameThread);
  const clearThread = useMutation(api.forgeConversations.clearThread);

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [personality, setPersonality] = useState<PersonalityType>("sarcastic-friend");
  const [muted, setMuted] = useState(false);
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const autoSelectedRef = useRef(false);

  // Sync personality from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSONALITY_STORAGE_KEY) as PersonalityType | null;
      if (stored) setPersonality(stored);
      setMuted(localStorage.getItem(MUTED_STORAGE_KEY) === "true");
    } catch {}
  }, []);

  const handlePersonalityChange = useCallback((p: PersonalityType) => {
    setPersonality(p);
    try { localStorage.setItem(PERSONALITY_STORAGE_KEY, p); } catch {}
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try { localStorage.setItem(MUTED_STORAGE_KEY, next ? "true" : ""); } catch {}
      return next;
    });
  }, []);

  // Auto-select most recent thread on first load
  useEffect(() => {
    if (autoSelectedRef.current || !recentThreads) return;
    autoSelectedRef.current = true;
    if (recentThreads.length > 0) {
      setActiveThreadId(recentThreads[0].threadId);
    }
  }, [recentThreads]);

  // Focus edit input when editing
  useEffect(() => {
    if (editingTitle && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTitle]);

  const handleNewConversation = useCallback(() => {
    const newId = generateThreadId();
    setActiveThreadId(newId);
  }, []);

  const handleDelete = useCallback(async (threadId: string) => {
    await deleteThread({ threadId });
    setConfirmDelete(null);
    if (threadId === activeThreadId) {
      // Select next available thread or create new
      const remaining = recentThreads?.filter((t) => t.threadId !== threadId);
      if (remaining && remaining.length > 0) {
        setActiveThreadId(remaining[0].threadId);
      } else {
        setActiveThreadId(null);
      }
    }
  }, [deleteThread, activeThreadId, recentThreads]);

  const handleRename = useCallback(async (threadId: string) => {
    if (!editValue.trim()) {
      setEditingTitle(null);
      return;
    }
    await renameThread({ threadId, title: editValue.trim() });
    setEditingTitle(null);
  }, [editValue, renameThread]);

  const handleClear = useCallback(async (threadId: string) => {
    await clearThread({ threadId });
  }, [clearThread]);

  const filteredThreads = (recentThreads ?? []).filter((t) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    const title = (t.title || "Untitled").toLowerCase();
    return title.includes(q);
  });

  const activeThread = recentThreads?.find((t) => t.threadId === activeThreadId);
  const activeTitle = activeThread?.title || "New conversation";
  const activeTokens = activeThread
    ? activeThread.messages.reduce((sum: number, m: { content: string }) => sum + estimateTokens(m.content), 0)
    : 0;

  return (
    <div className="h-[calc(100vh-48px)] bg-forge-bg flex flex-col">

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10 shrink-0">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="text-forge-text/40 hover:text-forge-text/70 text-sm transition-colors"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? "◁" : "▷"}
        </button>

        {activeThreadId && (
          <>
            <h1 className="text-sm font-medium text-forge-text/80 font-mono truncate max-w-md">
              {activeTitle}
            </h1>
            <div className="ml-auto flex items-center gap-3 text-[10px] text-forge-text/30 font-mono">
              <span>{activeThread?.messages.length ?? 0} msgs</span>
              <span>~{formatTokens(activeTokens)} tokens</span>
              {activeTokens > 120000 && (
                <span className="text-forge-warning" title="Nearing context window limit">⚠ nearing limit</span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — thread list */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-white/10 flex flex-col shrink-0">
            {/* New chat + search */}
            <div className="p-3 space-y-2 shrink-0">
              <button
                onClick={handleNewConversation}
                className="w-full px-3 py-2 rounded-lg bg-forge-accent/15 text-forge-accent text-sm font-medium border border-forge-accent/30 hover:bg-forge-accent/25 transition-colors"
              >
                + New Chat
              </button>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search threads..."
                className="w-full px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded text-forge-text placeholder-forge-text/30 focus:outline-none focus:border-forge-accent/50"
              />
            </div>

            {/* Thread list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 min-h-0">
              {filteredThreads.length === 0 && (
                <div className="text-xs text-forge-text/30 text-center mt-4">
                  {searchFilter ? "No matches" : "No conversations yet"}
                </div>
              )}
              {filteredThreads.map((t) => {
                const isActive = t.threadId === activeThreadId;
                const title = t.title || "Untitled";
                const threadTokens = t.messages.reduce((sum: number, m: { content: string }) => sum + estimateTokens(m.content), 0);

                return (
                  <div
                    key={t.threadId}
                    className={`rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer group ${
                      isActive
                        ? "bg-forge-accent/10 border border-forge-accent/30"
                        : "border border-transparent hover:border-white/10 hover:bg-white/5"
                    }`}
                    onClick={() => {
                      if (!isActive) setActiveThreadId(t.threadId);
                    }}
                  >
                    {editingTitle === t.threadId ? (
                      <input
                        ref={editInputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleRename(t.threadId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(t.threadId);
                          if (e.key === "Escape") setEditingTitle(null);
                        }}
                        className="w-full bg-white/10 border border-forge-accent/40 rounded px-1.5 py-0.5 text-xs text-forge-text focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-start justify-between gap-1">
                        <span className={`truncate font-medium ${isActive ? "text-forge-accent" : "text-forge-text/70"}`}>
                          {title}
                        </span>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTitle(t.threadId);
                              setEditValue(title);
                            }}
                            className="p-0.5 text-forge-text/30 hover:text-forge-text/70"
                            title="Rename"
                          >
                            ✎
                          </button>
                          {confirmDelete === t.threadId ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(t.threadId);
                              }}
                              className="p-0.5 text-red-400 text-[10px]"
                              title="Confirm delete"
                            >
                              confirm?
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete(t.threadId);
                                setTimeout(() => setConfirmDelete(null), 3000);
                              }}
                              className="p-0.5 text-forge-text/30 hover:text-red-400"
                              title="Delete"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 text-forge-text/30">
                      <span>{t.messages.length} msgs</span>
                      <span>~{formatTokens(threadTokens)}</span>
                      <span className="ml-auto">{timeAgo(t.updatedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Personality settings */}
            <div className="border-t border-white/10 shrink-0">
              <button
                onClick={() => setPersonalityOpen((v) => !v)}
                className="w-full px-3 py-2 text-[10px] font-mono text-forge-text/40 uppercase tracking-wider hover:text-forge-text/60 transition-colors flex items-center justify-between"
              >
                <span>Agent Personality</span>
                <span>{personalityOpen ? "▾" : "▸"}</span>
              </button>
              {personalityOpen && (
                <div className="px-3 pb-3 space-y-1.5">
                  {(Object.entries(PERSONALITY_META) as [PersonalityType, typeof PERSONALITY_META[PersonalityType]][]).map(([id, meta]) => (
                    <button
                      key={id}
                      onClick={() => handlePersonalityChange(id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg border text-xs transition-colors ${
                        personality === id
                          ? "border-forge-accent/40 bg-forge-accent/15 text-forge-accent"
                          : "border-transparent hover:border-white/10 hover:bg-white/5 text-forge-text/50"
                      }`}
                    >
                      <span className="font-medium block">{meta.name}</span>
                      <span className="text-[10px] opacity-60">{meta.description}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleToggleMute}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-forge-text/40 hover:text-forge-text/60 transition-colors flex items-center gap-2 mt-1"
                  >
                    <span className="font-mono">{muted ? "[ ]" : "[x]"}</span>
                    <span>{muted ? "Unmute quips" : "Mute quips"}</span>
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main chat area */}
        <main className="flex-1 min-h-0 flex flex-col">
          {activeThreadId ? (
            <AgentChat
              key={activeThreadId}
              threadId={activeThreadId}
              personality={personality}
              onNewConversation={handleNewConversation}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-forge-text/30 text-sm">No conversation selected</div>
                <button
                  onClick={handleNewConversation}
                  className="px-4 py-2 rounded-lg bg-forge-accent/15 text-forge-accent text-sm border border-forge-accent/30 hover:bg-forge-accent/25 transition-colors"
                >
                  + New Chat
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
