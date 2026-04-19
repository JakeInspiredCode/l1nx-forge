"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearOnboardingFlag } from "@/components/onboarding";

const NAV_ITEMS = [
  { href: "/", label: "Galaxy Map", icon: "✦", color: "var(--color-v2-cyan)" },
  { href: "/missions", label: "Missions", icon: "◆", color: "var(--color-v2-amber)" },
  { href: "/arsenal", label: "Arsenal", icon: "⬡", color: "var(--color-v2-green)" },
  { href: "/battle-station", label: "Battlestation", icon: "⚡", color: "var(--color-v2-danger)" },
  { href: "/comms", label: "Comms", icon: "◎", color: "var(--color-v2-purple)" },
  { href: "/profile", label: "Profile", icon: "▲", color: "var(--color-v2-silver)" },
];

// Sub-routes that should highlight each hub
const HUB_ROUTES: Record<string, string[]> = {
  "/missions": ["/missions", "/study"],
  "/arsenal": ["/arsenal", "/train", "/explore", "/foundations", "/terminal", "/cards", "/drill", "/filesystem-navigator", "/command-dissector", "/filesystem-types", "/boot-learn", "/boot-triage", "/train/quick-draw", "/train/diagnosis", "/explore/boot-process", "/explore/visual-explorer"],
  "/comms": ["/comms", "/stories"],
  "/profile": ["/profile", "/progress"],
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const children = HUB_ROUTES[href];
  if (children) return children.some((r) => pathname === r || pathname.startsWith(r + "/"));
  return pathname.startsWith(href);
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: "rgba(5, 5, 8, 0.85)",
        borderBottom: "1px solid var(--color-v2-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span
              className="mono font-bold text-base tracking-wider"
              style={{ color: "var(--color-v2-cyan)" }}
            >
              L1NX
            </span>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1 ml-4 flex-1 justify-center">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className="nav-tab relative px-2.5 sm:px-3 py-1.5 rounded text-xs transition-all duration-150 flex items-center gap-1.5"
                  style={{
                    color: active ? item.color : "var(--color-v2-text-dim)",
                    background: active ? `color-mix(in srgb, ${item.color} 12%, transparent)` : "transparent",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: active ? 600 : 500,
                    letterSpacing: "0.04em",
                  }}
                >
                  <span className="text-[10px]">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                      style={{
                        width: "60%",
                        background: item.color,
                        boxShadow: `0 0 8px ${item.color}`,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
          <button
            onClick={() => {
              clearOnboardingFlag();
              if (pathname === "/") {
                window.location.reload();
              } else {
                router.push("/");
              }
            }}
            title="Relaunch the onboarding guide"
            className="ml-2 px-2 h-7 flex items-center gap-1 rounded transition-colors text-[11px] shrink-0"
            style={{
              color: "var(--color-v2-text-muted)",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            <span>?</span>
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
