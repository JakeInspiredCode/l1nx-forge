"use client";

import { useState } from "react";
import { QUICK_REF } from "@/lib/seeds/foundations-content";

export default function QuickRefPanel() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 200,
          padding: "10px 18px", background: "rgba(80,200,255,0.15)",
          border: "1px solid rgba(80,200,255,0.3)", borderRadius: 8,
          color: "#50C8FF", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}
      >
        Quick Ref
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 200,
      width: 340, maxHeight: "70vh", overflowY: "auto",
      background: "rgba(15,15,25,0.97)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: "16px 20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "#50C8FF", fontWeight: 700, fontSize: 14, letterSpacing: "0.5px" }}>
          QUICK REFERENCE
        </span>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "none", border: "none", color: "#667",
            fontSize: 18, cursor: "pointer", padding: "2px 6px",
          }}
        >
          x
        </button>
      </div>
      {QUICK_REF.map((entry) => (
        <div key={entry.term} style={{
          padding: "8px 0",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <span style={{ color: "#E8ECF0", fontWeight: 600, fontSize: 13 }}>
            {entry.term}
          </span>
          <span style={{ color: "#889", fontSize: 13 }}> — {entry.def}</span>
        </div>
      ))}
    </div>
  );
}
