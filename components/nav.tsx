"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearOnboardingFlag } from "@/components/onboarding";

const NAV_ITEMS = [
  { href: "/", label: "Star Map", icon: "✦" },
  { href: "/missions", label: "Mission Board", icon: "◆" },
  { href: "/arsenal", label: "Arsenal", icon: "⬡" },
  { href: "/comms", label: "Comms", icon: "◎" },
  { href: "/profile", label: "Profile", icon: "▲" },
];

// Sub-routes that should highlight each hub
const HUB_ROUTES: Record<string, string[]> = {
  "/missions": ["/missions", "/study"],
  "/arsenal": ["/arsenal", "/train", "/explore", "/foundations", "/terminal", "/cards", "/drill", "/filesystem-navigator", "/command-dissector", "/filesystem-types", "/boot-learn", "/boot-triage", "/train/quick-draw", "/train/diagnosis", "/explore/boot-process", "/explore/visual-explorer"],
  "/comms": ["/comms", "/interview", "/stories", "/agent"],
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
    <nav aria-label="Main navigation" className="border-b border-forge-border bg-forge-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="mono text-forge-accent font-bold text-lg">L1NX</span>
          </Link>
          <div className="flex items-center gap-1 ml-6 flex-1">
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
            className="ml-2 px-2 h-8 flex items-center gap-1 rounded-md text-forge-text-dim hover:text-forge-text hover:bg-forge-surface-2 transition-colors text-xs"
          >
            <span>?</span>
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
