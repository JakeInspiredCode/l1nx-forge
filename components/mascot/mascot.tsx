"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MascotAvatar from "./mascot-avatar";
import SpeechBubble from "./speech-bubble";
import AgentChat from "@/components/agent-chat";
import { getQuip } from "@/lib/mascot/personalities";
import {
  PersonalityType,
  MascotExpression,
  MascotMessage,
  MascotEventDetail,
  MascotTrigger,
  MASCOT_EVENT_NAME,
  PERSONALITY_STORAGE_KEY,
  MUTED_STORAGE_KEY,
  WELCOMED_SESSION_KEY,
  CARD_REVIEW_COOLDOWN_MS,
} from "@/lib/mascot/types";

const CARD_TRIGGERS = new Set<MascotTrigger>(["card-again", "card-hard", "card-good", "card-easy"]);
const STUDY_PATHS = ["/forge/", "/study/", "/study", "/interview"];
const IDLE_MS = 30_000;
const POKE_COOLDOWN_MS = 5_000;

function readStorage(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function writeStorage(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}

function generateThreadId(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function Mascot() {
  const pathname = usePathname();

  // ── Mascot state ──
  const [personality, setPersonality] = useState<PersonalityType>("sarcastic-friend");
  const [muted, setMuted] = useState(false);
  const [expression, setExpression] = useState<MascotExpression>("chill");
  const [currentMessage, setCurrentMessage] = useState<MascotMessage | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ── Chat panel state ──
  const [panelOpen, setPanelOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const recentThreads = useQuery(api.forgeConversations.getRecent, { limit: 10 });

  const queueRef = useRef<MascotMessage[]>([]);
  const lastCardTrigger = useRef(0);
  const lastPoke = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleFired = useRef(false);
  const prevPanelOpen = useRef(false);

  // ── Sync from localStorage after hydration ──
  useEffect(() => {
    const storedPersonality = readStorage(PERSONALITY_STORAGE_KEY, "sarcastic-friend") as PersonalityType;
    const storedMuted = readStorage(MUTED_STORAGE_KEY, "") === "true";
    setPersonality(storedPersonality);
    setMuted(storedMuted);
    setHydrated(true);
  }, []);

  // ── Re-sync personality when localStorage changes (e.g. from /agent page) ──
  useEffect(() => {
    const handler = () => {
      const p = readStorage(PERSONALITY_STORAGE_KEY, "sarcastic-friend") as PersonalityType;
      setPersonality(p);
      setMuted(readStorage(MUTED_STORAGE_KEY, "") === "true");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ── Sync to most recent thread each time panel opens ──
  useEffect(() => {
    const justOpened = panelOpen && !prevPanelOpen.current;
    prevPanelOpen.current = panelOpen;
    if (justOpened && recentThreads) {
      if (recentThreads.length > 0) {
        setActiveThreadId(recentThreads[0].threadId);
      } else {
        setActiveThreadId(generateThreadId());
      }
    }
  }, [panelOpen, recentThreads]);

  // ── Listen for open-floating-coach events (from study pages etc.) ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message?: string } | undefined;
      if (detail?.message) setInitialMessage(detail.message);
      setPanelOpen(true);
    };
    window.addEventListener("open-floating-coach", handler);
    return () => window.removeEventListener("open-floating-coach", handler);
  }, []);

  // ── Enqueue a message ──
  const enqueue = useCallback((msg: MascotMessage) => {
    if (currentMessage) {
      queueRef.current.push(msg);
    } else {
      setCurrentMessage(msg);
      setExpression(msg.expression);
      setBouncing(true);
      setTimeout(() => setBouncing(false), 300);
    }
  }, [currentMessage]);

  // ── Process queue when current message dismissed ──
  const handleDismiss = useCallback(() => {
    const next = queueRef.current.shift();
    if (next) {
      setCurrentMessage(next);
      setExpression(next.expression);
      setBouncing(true);
      setTimeout(() => setBouncing(false), 300);
    } else {
      setCurrentMessage(null);
      setExpression("chill");
    }
  }, []);

  // ── Listen for mascot events ──
  useEffect(() => {
    const handler = (e: Event) => {
      if (muted) return;
      const { trigger, meta } = (e as CustomEvent<MascotEventDetail>).detail;

      if (CARD_TRIGGERS.has(trigger)) {
        const now = Date.now();
        if (now - lastCardTrigger.current < CARD_REVIEW_COOLDOWN_MS) return;
        lastCardTrigger.current = now;
      }

      const msg = getQuip(personality, trigger, meta);
      enqueue(msg);
    };

    window.addEventListener(MASCOT_EVENT_NAME, handler);
    return () => window.removeEventListener(MASCOT_EVENT_NAME, handler);
  }, [personality, muted, enqueue]);

  // ── App-load welcome (once per browser session, after hydration) ──
  useEffect(() => {
    if (!hydrated || muted) return;
    try {
      if (sessionStorage.getItem(WELCOMED_SESSION_KEY)) return;
      sessionStorage.setItem(WELCOMED_SESSION_KEY, "1");
    } catch { return; }

    const t = setTimeout(() => {
      const msg = getQuip(personality, "app-load");
      enqueue(msg);
    }, 800);
    return () => clearTimeout(t);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Idle detection ──
  useEffect(() => {
    const isStudyPage = STUDY_PATHS.some((p) => pathname.startsWith(p));
    if (!isStudyPage || muted) return;

    const resetIdle = () => {
      idleFired.current = false;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (idleFired.current) return;
        idleFired.current = true;
        const msg = getQuip(personality, "idle-nudge");
        enqueue(msg);
      }, IDLE_MS);
    };

    resetIdle();
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("scroll", resetIdle);

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("scroll", resetIdle);
    };
  }, [pathname, muted, personality, enqueue]);

  // ── Hover → poke (throttled) ──
  const handleHover = useCallback(() => {
    if (muted || panelOpen) return;
    const now = Date.now();
    if (now - lastPoke.current < POKE_COOLDOWN_MS) return;
    lastPoke.current = now;
    const msg = getQuip(personality, "poke");
    enqueue(msg);
  }, [personality, muted, panelOpen, enqueue]);

  // ── Click → toggle chat panel ──
  const handleClick = useCallback(() => {
    setPanelOpen((v) => {
      if (v) {
        setInitialMessage(undefined);
        setShowPicker(false);
      }
      return !v;
    });
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveThreadId(generateThreadId());
    setShowPicker(false);
  }, []);

  const handleSelectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
    setShowPicker(false);
  }, []);

  if (!hydrated) return null;

  return (
    <>
      {/* ── Chat panel ── */}
      <div
        className={`fixed bottom-20 right-6 z-[60] w-96 h-[560px] bg-forge-bg border border-white/15 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          panelOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-forge-text font-mono">Agent</span>
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="text-[10px] text-forge-text/40 hover:text-forge-text/60 border border-white/10 rounded px-1.5 py-0.5 transition-colors"
              title="Switch conversation"
            >
              ▾
            </button>
            <button
              onClick={handleNewChat}
              className="text-[10px] text-forge-text/40 hover:text-forge-accent border border-white/10 rounded px-1.5 py-0.5 transition-colors"
              title="New conversation"
            >
              +
            </button>
          </div>
          <a
            href="/agent"
            className="text-xs text-forge-accent/70 hover:text-forge-accent transition-colors"
          >
            Full view →
          </a>
        </div>

        {/* Thread picker dropdown */}
        {showPicker && (
          <div className="border-b border-white/10 max-h-40 overflow-y-auto bg-forge-bg/95 backdrop-blur-sm">
            {recentThreads?.map((t) => (
              <button
                key={t.threadId}
                onClick={() => handleSelectThread(t.threadId)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 transition-colors ${
                  t.threadId === activeThreadId ? "text-forge-accent" : "text-forge-text/60"
                }`}
              >
                <div className="truncate font-medium">{t.title || "Untitled"}</div>
                <div className="text-forge-text/30">{t.messages.length} msgs</div>
              </button>
            ))}
            {(!recentThreads || recentThreads.length === 0) && (
              <div className="px-3 py-2 text-xs text-forge-text/30">No conversations yet</div>
            )}
          </div>
        )}

        {panelOpen && activeThreadId && (
          <AgentChat
            key={activeThreadId}
            threadId={activeThreadId}
            compact
            initialMessage={initialMessage}
          />
        )}
      </div>

      {/* ── Mascot avatar + speech bubble ── */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <SpeechBubble
          message={currentMessage?.text ?? null}
          duration={currentMessage?.duration ?? 4000}
          onDismiss={handleDismiss}
        />

        <button
          onClick={handleClick}
          onMouseEnter={handleHover}
          className="block hover:scale-110 active:scale-95 transition-transform"
          title="Open agent chat"
          aria-label="Open agent chat"
        >
          <MascotAvatar
            expression={expression}
            personality={personality}
            size={48}
            bounce={bouncing}
          />
        </button>
      </div>
    </>
  );
}
