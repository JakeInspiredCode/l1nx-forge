"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "◆" },
  { href: "/train", label: "Train", icon: "▶" },
  { href: "/explore", label: "Explore", icon: "◒" },
  { href: "/interview", label: "Interview", icon: "◎" },
  { href: "/agent", label: "Agent", icon: "⬡" },
  { href: "/progress", label: "Progress", icon: "▲" },
];

// Sub-routes that should highlight each hub
const HUB_ROUTES: Record<string, string[]> = {
  "/train": ["/train", "/study", "/forge/speed-run", "/drill"],
  "/explore": ["/explore", "/foundations", "/terminal", "/cards", "/explore/boot-process"],
  "/interview": ["/interview", "/stories"],
  "/agent": ["/agent"],
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const children = HUB_ROUTES[href];
  if (children) return children.some((r) => pathname === r || pathname.startsWith(r + "/"));
  return pathname.startsWith(href);
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="border-b border-forge-border bg-forge-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="mono text-forge-accent font-bold text-lg">L1NX</span>
          </Link>
          <div className="flex items-center gap-1 ml-6">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
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
