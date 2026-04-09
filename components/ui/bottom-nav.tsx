"use client";

import Link from "next/link";

interface BottomNavProps {
  activePage: string;
}

const NAV_ITEMS = [
  {
    id: "battle-station",
    href: "/battle-station",
    label: "Battle Station",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    id: "galaxy-map",
    href: "/",
    label: "Sector View",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M12 2l2.09 6.26L21 9.27l-5 4.87L17.18 21 12 17.77 6.82 21 8 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: "missions",
    href: "/missions",
    label: "Missions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "resources",
    href: "/arsenal",
    label: "Resources",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    ),
  },
  {
    id: "profile",
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
  },
];

export default function BottomNav({ activePage }: BottomNavProps) {
  return (
    <div className="bottom-nav-bar">
      {/* Ship name */}
      <div className="flex items-center gap-2 mr-4 shrink-0">
        <svg viewBox="0 0 32 16" fill="none" stroke="#06d6d6" strokeWidth="1" className="w-8 h-4 opacity-60">
          <path d="M2 8h8l4-4h8l6 4-6 4H14l-4-4" />
          <circle cx="22" cy="8" r="2" fill="#06d6d6" opacity="0.4" />
        </svg>
        <div className="flex flex-col">
          <span className="text-[9px] display-font tracking-[0.15em] text-v2-cyan">
            Starship Enterprise
          </span>
          <span className="text-[7px] telemetry-font text-v2-text-muted">
            (Training Vessel)
          </span>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`nav-btn-scifi ${activePage === item.id ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
