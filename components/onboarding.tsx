"use client";

import { useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "l1nx-onboarding-done";

const SCREENS = [
  {
    title: "What is L1NX?",
    body: "L1NX prepares you for an advanced data center technician role. Many users are already working in data centers — this builds the Linux, networking, power, cabling, and ops knowledge that separates a strong tech from an average one.",
  },
  {
    title: "How it works",
    body: "You learn through flashcards, interactive lessons, a terminal simulator, troubleshooting scenarios, timed games, and hands-on explorers. The app tracks what you know and what you don't, and builds a daily study plan that focuses on your weak spots. You move through four tiers — from basic vocabulary up to complex troubleshooting.",
  },
  {
    title: "What you'll get",
    body: "If you follow the study plan consistently, you'll be prepared to walk into any data center and confidently handle Linux administration, basic networking, hardware procedures, and incident response. Expect roughly 4-6 weeks of daily practice (15-30 minutes per day) to get through the core material.",
  },
];

export function clearOnboardingFlag() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const finish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    onComplete();
  };

  // Final screen — start paths
  if (step >= SCREENS.length) {
    return (
      <div className="fixed inset-0 z-50 bg-forge-bg flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-forge-surface border border-forge-border rounded-lg p-8">
          <h2 className="text-xl font-bold text-forge-text mb-6">Where to start</h2>

          <div className="space-y-3 mb-8">
            <Link
              href="/foundations"
              onClick={finish}
              className="block w-full p-4 bg-forge-surface-2 border border-forge-border rounded-lg hover:border-forge-accent transition-colors text-left"
            >
              <p className="text-forge-text font-medium">New to Linux?</p>
              <p className="text-forge-text-dim text-sm">Start with Linux Foundations</p>
            </Link>

            <Link
              href="/study"
              onClick={finish}
              className="block w-full p-4 bg-forge-surface-2 border border-forge-border rounded-lg hover:border-forge-accent transition-colors text-left"
            >
              <p className="text-forge-text font-medium">Want to review DC topics?</p>
              <p className="text-forge-text-dim text-sm">Start with Tier 1 flashcards</p>
            </Link>

            <button
              onClick={finish}
              className="block w-full p-4 bg-forge-surface-2 border border-forge-border rounded-lg hover:border-forge-accent transition-colors text-left"
            >
              <p className="text-forge-text font-medium">Just explore</p>
              <p className="text-forge-text-dim text-sm">Go to the dashboard</p>
            </button>
          </div>

          <button
            onClick={finish}
            className="text-forge-text-dim text-sm hover:text-forge-text transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  const screen = SCREENS[step];

  return (
    <div className="fixed inset-0 z-50 bg-forge-bg flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-forge-surface border border-forge-border rounded-lg p-8">
        {/* Progress dots */}
        <div className="flex gap-2 mb-6">
          {SCREENS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-forge-accent" : "bg-forge-surface-2"
              }`}
            />
          ))}
          <div
            className={`h-1 flex-1 rounded-full ${
              step >= SCREENS.length ? "bg-forge-accent" : "bg-forge-surface-2"
            }`}
          />
        </div>

        <h2 className="text-xl font-bold text-forge-text mb-4">{screen.title}</h2>
        <p className="text-forge-text-dim leading-relaxed mb-8">{screen.body}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={finish}
            className="text-forge-text-dim text-sm hover:text-forge-text transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2 bg-forge-accent text-white rounded-lg hover:bg-forge-accent/90 transition-colors font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
