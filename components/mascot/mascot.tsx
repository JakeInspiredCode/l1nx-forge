"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import MascotAvatar from "./mascot-avatar";
import SpeechBubble from "./speech-bubble";
import MascotSettings from "./mascot-settings";
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

function readStorage(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function writeStorage(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}

export default function Mascot() {
  const pathname = usePathname();

  // Always start with static defaults so server & client render identically.
  // localStorage is read in a useEffect after hydration to avoid mismatches.
  const [personality, setPersonality] = useState<PersonalityType>("sarcastic-friend");
  const [muted, setMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expression, setExpression] = useState<MascotExpression>("chill");
  const [currentMessage, setCurrentMessage] = useState<MascotMessage | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const queueRef = useRef<MascotMessage[]>([]);
  const lastCardTrigger = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleFired = useRef(false);

  // ── Sync from localStorage after hydration ──
  useEffect(() => {
    const storedPersonality = readStorage(PERSONALITY_STORAGE_KEY, "sarcastic-friend") as PersonalityType;
    const storedMuted = readStorage(MUTED_STORAGE_KEY, "") === "true";
    setPersonality(storedPersonality);
    setMuted(storedMuted);
    setHydrated(true);
  }, []);

  // ── Personality change ──
  const handlePersonalityChange = useCallback((p: PersonalityType) => {
    setPersonality(p);
    writeStorage(PERSONALITY_STORAGE_KEY, p);
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      writeStorage(MUTED_STORAGE_KEY, next ? "true" : "");
      return next;
    });
  }, []);

  // ── Enqueue a message ──
  const enqueue = useCallback((msg: MascotMessage) => {
    if (currentMessage) {
      queueRef.current.push(msg);
    } else {
      setCurrentMessage(msg);
      setExpression(msg.expression);
      triggerBounce();
    }
  }, [currentMessage]);

  const triggerBounce = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 300);
  };

  // ── Process queue when current message dismissed ──
  const handleDismiss = useCallback(() => {
    const next = queueRef.current.shift();
    if (next) {
      setCurrentMessage(next);
      setExpression(next.expression);
      triggerBounce();
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

      // Throttle card-review triggers
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

    // Small delay so the page has rendered
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

  const handlePoke = useCallback(() => {
    if (muted) return;
    const msg = getQuip(personality, "poke");
    enqueue(msg);
  }, [personality, muted, enqueue]);

  // Don't render until client has hydrated — avoids SSR/client HTML mismatches
  if (!hydrated) return null;

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-[88px] sm:right-6 z-30">
      {/* Settings panel */}
      {settingsOpen && (
        <MascotSettings
          personality={personality}
          muted={muted}
          onChange={handlePersonalityChange}
          onToggleMute={handleToggleMute}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Speech bubble */}
      <SpeechBubble
        message={currentMessage?.text ?? null}
        duration={currentMessage?.duration ?? 4000}
        onDismiss={handleDismiss}
      />

      {/* Avatar + gear overlay */}
      <div className="relative group">
        {/* Poke the mascot */}
        <button
          onClick={handlePoke}
          className="block hover:scale-110 active:scale-95 transition-transform"
          title="Say something!"
          aria-label="Poke mascot"
        >
          <MascotAvatar
            expression={expression}
            personality={personality}
            size={48}
            bounce={bouncing}
          />
        </button>

        {/* Gear icon — visible on hover */}
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className="
            absolute -top-2 -right-2
            w-5 h-5 rounded-full
            bg-forge-surface border border-forge-border
            flex items-center justify-center
            opacity-0 group-hover:opacity-100
            transition-opacity duration-150
            hover:bg-forge-hover
          "
          title="Mascot settings"
          aria-label="Open mascot settings"
        >
          <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" className="text-forge-muted">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
