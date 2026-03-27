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

  const [personality, setPersonality] = useState<PersonalityType>(() =>
    readStorage(PERSONALITY_STORAGE_KEY, "sarcastic-friend") as PersonalityType
  );
  const [muted, setMuted] = useState(() => readStorage(MUTED_STORAGE_KEY, "") === "true");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expression, setExpression] = useState<MascotExpression>("chill");
  const [currentMessage, setCurrentMessage] = useState<MascotMessage | null>(null);
  const [bouncing, setBouncing] = useState(false);

  const queueRef = useRef<MascotMessage[]>([]);
  const lastCardTrigger = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleFired = useRef(false);

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

  // ── App-load welcome (once per browser session) ──
  useEffect(() => {
    if (muted) return;
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className="fixed bottom-3 left-3 sm:bottom-6 sm:left-6 z-30">
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

      {/* Avatar button */}
      <button
        onClick={() => setSettingsOpen((v) => !v)}
        className="block hover:scale-110 active:scale-95 transition-transform"
        title="Mascot settings"
        aria-label="Open mascot settings"
      >
        <MascotAvatar
          expression={expression}
          personality={personality}
          size={48}
          bounce={bouncing}
        />
      </button>
    </div>
  );
}
