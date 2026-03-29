"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "◆" },
  { href: "/study", label: "Study", icon: "▶" },
  { href: "/interview", label: "Interview", icon: "◎" },
  { href: "/forge/speed-run", label: "Speed Run", icon: "⚡" },
  { href: "/progress", label: "Progress", icon: "▲" },
  { href: "/stories", label: "Stories", icon: "◈" },
  { href: "/cards", label: "Cards", icon: "📇" },
  { href: "/history", label: "History", icon: "◷" },
  { href: "/agent", label: "Agent", icon: "⬡" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-forge-border bg-forge-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="mono text-forge-accent font-bold text-lg">L1NX</span>
            <span className="text-forge-text-dim text-sm hidden sm:inline">Interview Forge</span>
          </Link>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors duration-150 flex items-center gap-1.5 ${
                    active
                      ? "bg-forge-accent/15 text-forge-accent font-medium"
                      : "text-forge-text-dim hover:text-forge-text hover:bg-forge-surface-2"
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
