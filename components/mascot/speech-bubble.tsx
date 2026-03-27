"use client";

import { useEffect, useState } from "react";

interface SpeechBubbleProps {
  message: string | null;
  duration: number;
  onDismiss: () => void;
}

export default function SpeechBubble({ message, duration, onDismiss }: SpeechBubbleProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!message) return;
    setExiting(false);

    const exitTimer = setTimeout(() => setExiting(true), duration - 200);
    const dismissTimer = setTimeout(onDismiss, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={`
        absolute right-14 bottom-2 max-w-[260px] sm:max-w-[320px]
        bg-forge-surface border border-forge-border rounded-xl
        px-3 py-2 text-xs text-forge-text leading-relaxed
        shadow-lg pointer-events-none
        ${exiting ? "mascot-bubble-exit" : "mascot-bubble-enter"}
      `}
    >
      {/* Triangle pointer */}
      <div
        className="absolute -right-1.5 bottom-4 w-0 h-0"
        style={{
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderLeft: "6px solid var(--color-forge-border)",
        }}
      />
      <div
        className="absolute -right-[5px] bottom-4 w-0 h-0"
        style={{
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderLeft: "6px solid var(--color-forge-surface)",
        }}
      />
      {message}
    </div>
  );
}
