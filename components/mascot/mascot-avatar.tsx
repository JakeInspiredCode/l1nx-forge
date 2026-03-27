"use client";

import { MascotExpression, PersonalityType, PERSONALITY_META } from "@/lib/mascot/types";

interface MascotAvatarProps {
  expression: MascotExpression;
  personality: PersonalityType;
  size?: number;
  bounce?: boolean;
}

export default function MascotAvatar({ expression, personality, size = 48, bounce = false }: MascotAvatarProps) {
  const accent = PERSONALITY_META[personality].accent;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`transition-all duration-200 ${bounce ? "mascot-bounce" : ""}`}
      style={{ filter: `drop-shadow(0 0 6px ${accent}40)` }}
    >
      {/* Antenna */}
      <line x1="24" y1="8" x2="24" y2="2" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="2" r="2.5" fill={accent} />

      {/* Head */}
      <rect x="8" y="8" width="32" height="32" rx="10" ry="10"
        fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />

      {/* Inner face glow */}
      <rect x="11" y="11" width="26" height="26" rx="8" ry="8"
        fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />

      {/* Eyes + Mouth — swapped per expression */}
      <Eyes expression={expression} />
      <Mouth expression={expression} />

      {/* Cheek dots — personality accent */}
      <circle cx="13" cy="28" r="1.5" fill={accent} opacity="0.4" />
      <circle cx="35" cy="28" r="1.5" fill={accent} opacity="0.4" />
    </svg>
  );
}

function Eyes({ expression }: { expression: MascotExpression }) {
  switch (expression) {
    case "happy":
      return (
        <>
          {/* Upward arcs ^^ */}
          <path d="M16 21 Q18.5 17, 21 21" fill="none" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round" />
          <path d="M27 21 Q29.5 17, 32 21" fill="none" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "stern":
      return (
        <>
          {/* Flat eyes with angled brows */}
          <circle cx="18.5" cy="21" r="2.5" fill="#e5e5e5" />
          <circle cx="29.5" cy="21" r="2.5" fill="#e5e5e5" />
          <line x1="15" y1="17" x2="21" y2="18" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="33" y1="17" x2="27" y2="18" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
    case "chill":
      return (
        <>
          {/* Half-closed eyes — horizontal ovals */}
          <ellipse cx="18.5" cy="21" rx="3" ry="1.5" fill="#e5e5e5" />
          <ellipse cx="29.5" cy="21" rx="3" ry="1.5" fill="#e5e5e5" />
        </>
      );
    case "smirk":
      return (
        <>
          {/* Left normal, right squinted */}
          <circle cx="18.5" cy="21" r="2.5" fill="#e5e5e5" />
          <ellipse cx="29.5" cy="21" rx="3" ry="1.5" fill="#e5e5e5" />
        </>
      );
  }
}

function Mouth({ expression }: { expression: MascotExpression }) {
  switch (expression) {
    case "happy":
      return <path d="M18 30 Q24 36, 30 30" fill="none" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" />;
    case "stern":
      return <line x1="18" y1="31" x2="30" y2="31" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" />;
    case "chill":
      return <path d="M20 30 Q24 33, 28 30" fill="none" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" />;
    case "smirk":
      return <path d="M18 31 Q24 31, 30 28" fill="none" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" />;
  }
}
