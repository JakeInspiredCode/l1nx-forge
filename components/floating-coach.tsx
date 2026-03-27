"use client";

import { useState, useEffect, useCallback } from "react";
import AgentChat from "./agent-chat";

const FLOAT_THREAD_ID = "coach-float";

export default function FloatingCoach() {
  const [open, setOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<"coach" | "quiz" | "mock-interview" | undefined>();
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  const handleOpenCoach = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail as { mode?: string; message?: string } | undefined;
    if (detail?.mode) setInitialMode(detail.mode as "coach" | "quiz" | "mock-interview");
    if (detail?.message) setInitialMessage(detail.message);
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener("open-floating-coach", handleOpenCoach);
    return () => window.removeEventListener("open-floating-coach", handleOpenCoach);
  }, [handleOpenCoach]);

  // Clear initial overrides once the panel closes
  const handleToggle = () => {
    setOpen((v) => {
      if (v) {
        // closing — reset overrides
        setInitialMode(undefined);
        setInitialMessage(undefined);
      }
      return !v;
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-forge-accent/90 hover:bg-forge-accent text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Open AI Coach"
        aria-label="Open AI Coach"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Sliding panel */}
      <div
        className={`fixed bottom-20 right-6 z-40 w-96 h-[560px] bg-forge-bg border border-white/15 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div>
            <span className="text-sm font-semibold text-forge-text font-mono">AI Coach</span>
            <span className="text-xs text-forge-text/40 ml-2">— quick chat</span>
          </div>
          <a
            href="/coach"
            className="text-xs text-forge-accent/70 hover:text-forge-accent transition-colors"
          >
            Open full →
          </a>
        </div>

        {open && (
          <AgentChat
            threadId={FLOAT_THREAD_ID}
            compact
            initialMode={initialMode}
            initialMessage={initialMessage}
          />
        )}
      </div>
    </>
  );
}
