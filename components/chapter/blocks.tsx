"use client";

import { useState, type ReactNode } from "react";
import type { CalloutVariant, TableCell } from "@/lib/types/chapter";
import { Prose } from "./prose";

// ─── Heading ────────────────────────────────────────────────────────────────

export function Heading({
  level,
  text,
  subtitle,
}: {
  level: 2 | 3;
  text: string;
  subtitle?: string;
}) {
  if (level === 2) {
    return (
      <>
        <h2
          style={{
            color: "#E8ECF0",
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 6px 0",
            lineHeight: 1.3,
          }}
        >
          {text}
        </h2>
        {subtitle && (
          <p
            style={{
              color: "#667",
              fontSize: 15,
              marginTop: 0,
              marginBottom: 24,
              fontStyle: "italic",
            }}
          >
            {subtitle}
          </p>
        )}
      </>
    );
  }
  return (
    <h3
      style={{
        color: "#E8ECF0",
        fontSize: 20,
        fontWeight: 700,
        margin: "28px 0 12px 0",
        lineHeight: 1.3,
      }}
    >
      {text}
    </h3>
  );
}

// ─── CodeBlock ──────────────────────────────────────────────────────────────

export function CodeBlock({
  code,
  label,
}: {
  code: string;
  label?: string;
  language?: string;
}) {
  return (
    <div style={{ margin: "16px 0" }}>
      {label && (
        <div
          style={{
            color: "#607080",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </div>
      )}
      <pre
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(80,200,255,0.12)",
          borderRadius: 8,
          padding: "14px 16px",
          overflowX: "auto",
          margin: 0,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 14,
          lineHeight: 1.6,
          color: "#C8D8E8",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

// ─── InfoTable ──────────────────────────────────────────────────────────────

function renderCell(cell: TableCell, key: string): ReactNode {
  if (typeof cell === "string") {
    return <Prose html={cell} key={key} />;
  }
  return (
    <code
      key={key}
      style={{
        background: "rgba(80,200,255,0.1)",
        color: "#7DD8FF",
        padding: "2px 7px",
        borderRadius: 4,
        fontSize: "0.92em",
        fontFamily:
          "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      }}
    >
      {cell.code}
    </code>
  );
}

export function InfoTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: TableCell[][];
}) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderBottom: "2px solid rgba(80,200,255,0.3)",
                  color: "#50C8FF",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                background: ri % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
              }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    color: "#C8CCD0",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ display: "block" }}>
                    {renderCell(cell, `${ri}-${ci}`)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Bullets ────────────────────────────────────────────────────────────────

const BULLET_COLORS = ["#50C8FF", "#FFA832", "#7AE87A", "#FF6B6B", "#C58AFF"];

export function Bullets({ items }: { items: string[] }) {
  return (
    <div style={{ display: "grid", gap: 6, margin: "12px 0 18px" }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            color: "#C0C4C8",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              color: BULLET_COLORS[i % BULLET_COLORS.length],
              marginTop: 2,
              flexShrink: 0,
              fontWeight: 700,
            }}
          >
            ›
          </span>
          <Prose html={item} />
        </div>
      ))}
    </div>
  );
}

// ─── Callout ────────────────────────────────────────────────────────────────

const CALLOUT_STYLES: Record<
  CalloutVariant,
  { accent: string; bg: string; label: string; icon: string }
> = {
  info: {
    accent: "#50C8FF",
    bg: "rgba(80,200,255,0.08)",
    label: "NOTE",
    icon: "◇",
  },
  warning: {
    accent: "#FFA832",
    bg: "rgba(255,170,50,0.08)",
    label: "WATCH OUT",
    icon: "⚠",
  },
  troubleshooting: {
    accent: "#FF6B6B",
    bg: "rgba(255,107,107,0.08)",
    label: "WHEN IT BREAKS",
    icon: "✦",
  },
};

export function Callout({
  variant,
  title,
  body,
}: {
  variant: CalloutVariant;
  title?: string;
  body: string;
}) {
  const s = CALLOUT_STYLES[variant];
  return (
    <div
      style={{
        padding: "14px 18px",
        borderRadius: 10,
        margin: "20px 0",
        background: s.bg,
        border: `1px solid ${s.accent}33`,
        borderLeft: `3px solid ${s.accent}`,
      }}
    >
      <div
        style={{
          color: s.accent,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.5px",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>{s.icon}</span>
        {title ? title.toUpperCase() : s.label}
      </div>
      <Prose html={body} />
    </div>
  );
}

// ─── ThinkAboutIt ───────────────────────────────────────────────────────────

export function ThinkAboutIt({
  scenario,
  hint,
  answer,
}: {
  scenario: string;
  hint?: string;
  answer: string;
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(255,170,50,0.08), rgba(255,120,20,0.04))",
        border: "1px solid rgba(255,170,50,0.25)",
        borderLeft: "3px solid #FFA832",
        borderRadius: 8,
        padding: "18px 20px",
        margin: "20px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          color: "#FFA832",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "0.5px",
        }}
      >
        <span style={{ fontSize: 16 }}>⚡</span> THINK ABOUT IT
      </div>
      <div style={{ color: "#E0D8CF" }}>
        <Prose html={scenario} />
      </div>
      {hint && (
        <p
          style={{
            color: "#A09080",
            fontSize: 14,
            fontStyle: "italic",
            margin: "0 0 12px 0",
          }}
        >
          Hint: {hint}
        </p>
      )}
      {!revealed && (
        <>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Try to answer before revealing — or reveal when ready..."
            style={{
              width: "100%",
              minHeight: 70,
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,170,50,0.2)",
              borderRadius: 6,
              padding: 12,
              color: "#E8E0D8",
              fontSize: 15,
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => setRevealed(true)}
            style={{
              marginTop: 10,
              padding: "8px 20px",
              background: "#FFA832",
              border: "none",
              borderRadius: 6,
              color: "#1A1A2E",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reveal Insight
          </button>
        </>
      )}
      {revealed && (
        <div
          style={{
            marginTop: 12,
            padding: 14,
            background: "rgba(255,170,50,0.1)",
            borderRadius: 6,
            border: "1px solid rgba(255,170,50,0.2)",
          }}
        >
          <div
            style={{
              color: "#FFA832",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            INSIGHT
          </div>
          <div style={{ color: "#E8E0D8" }}>
            <Prose html={answer} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KnowledgeCheck ─────────────────────────────────────────────────────────

export function KnowledgeCheck({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState<string | null>(null);

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(80,200,255,0.08), rgba(40,140,255,0.04))",
        border: "1px solid rgba(80,200,255,0.25)",
        borderLeft: "3px solid #50C8FF",
        borderRadius: 8,
        padding: "18px 20px",
        margin: "24px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          color: "#50C8FF",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "0.5px",
        }}
      >
        <span style={{ fontSize: 16 }}>◇</span> KNOWLEDGE CHECK
      </div>
      <div style={{ color: "#E0E4E8", fontWeight: 500 }}>
        <Prose html={question} />
      </div>
      {!revealed && (
        <>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Try to answer before checking — or check when ready..."
            style={{
              width: "100%",
              minHeight: 70,
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(80,200,255,0.2)",
              borderRadius: 6,
              padding: 12,
              color: "#E8E8F0",
              fontSize: 15,
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#7090A8", fontSize: 13, marginRight: 4 }}>
              Confidence:
            </span>
            {["Sure", "Unsure", "Guessing"].map((c) => (
              <button
                key={c}
                onClick={() => setConfidence(c)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  background:
                    confidence === c
                      ? c === "Sure"
                        ? "#2A8A4A"
                        : c === "Unsure"
                        ? "#AA7A20"
                        : "#AA3030"
                      : "rgba(255,255,255,0.05)",
                  border:
                    confidence === c
                      ? "none"
                      : "1px solid rgba(255,255,255,0.15)",
                  color: confidence === c ? "#FFF" : "#8899AA",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => setRevealed(true)}
              style={{
                marginLeft: "auto",
                padding: "8px 20px",
                background: "#50C8FF",
                border: "none",
                borderRadius: 6,
                color: "#1A1A2E",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Check Answer
            </button>
          </div>
        </>
      )}
      {revealed && (
        <div
          style={{
            marginTop: 12,
            padding: 14,
            background: "rgba(80,200,255,0.08)",
            borderRadius: 6,
            border: "1px solid rgba(80,200,255,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ color: "#50C8FF", fontWeight: 700, fontSize: 13 }}>
              ANSWER
            </span>
            {confidence && (
              <span
                style={{
                  fontSize: 12,
                  padding: "2px 10px",
                  borderRadius: 10,
                  background:
                    confidence === "Sure"
                      ? "rgba(42,138,74,0.3)"
                      : confidence === "Unsure"
                      ? "rgba(170,122,32,0.3)"
                      : "rgba(170,48,48,0.3)",
                  color:
                    confidence === "Sure"
                      ? "#5ADA7A"
                      : confidence === "Unsure"
                      ? "#DDAA44"
                      : "#EE6666",
                }}
              >
                You were: {confidence}
              </span>
            )}
          </div>
          <div style={{ color: "#E8E8F0" }}>
            <Prose html={answer} />
          </div>
        </div>
      )}
    </div>
  );
}
