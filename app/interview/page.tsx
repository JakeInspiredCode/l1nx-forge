"use client";

import Link from "next/link";

const TOOLS = [
  {
    href: "/interview/mock",
    icon: "◎",
    title: "Mock Interview",
    description: "Timed mock interviews with AI scoring — technical, behavioral, or mixed",
    color: "text-red-400",
    bg: "bg-red-500/8",
    border: "border-red-500/25",
  },
  {
    href: "/stories",
    icon: "◈",
    title: "Story Bank",
    description: "Build and refine your STAR-format behavioral stories",
    color: "text-purple-400",
    bg: "bg-purple-500/8",
    border: "border-purple-500/25",
  },
];

export default function InterviewHub() {
  return (
    <div className="min-h-screen bg-v2-bg-deep">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mono mb-1">Interview Prep</h1>
        <p className="text-sm text-forge-text-dim mb-6">
          Practice mock interviews and build your story bank
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOOLS.map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className={`rounded-xl p-5 border transition-all duration-150 ${t.bg} ${t.border} hover:ring-1 hover:ring-current ${t.color}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{t.icon}</span>
                <span className="font-semibold text-sm">{t.title}</span>
              </div>
              <p className="text-xs text-forge-text-dim">{t.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
