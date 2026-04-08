"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRoom } from "./room-provider";
import { useSoundEngine } from "@/lib/sound-engine";
import { clearOnboardingFlag } from "@/components/onboarding";

interface NavItem {
  id: string;
  href: string;
  label: string;
  room: string;
  color: string;
  colorBright: string;
  glow: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "star-map",
    href: "/",
    label: "Star Map",
    room: "star-map",
    color: "#06d6d6",
    colorBright: "#22f5ee",
    glow: "rgba(6, 214, 214, 0.3)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 2l2.09 6.26L21 9.27l-5 4.87L17.18 21 12 17.77 6.82 21 8 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: "missions",
    href: "/missions",
    label: "Mission Board",
    room: "missions",
    color: "#f59e0b",
    colorBright: "#fbbf24",
    glow: "rgba(245, 158, 11, 0.3)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "arsenal",
    href: "/arsenal",
    label: "Arsenal",
    room: "arsenal",
    color: "#22c55e",
    colorBright: "#4ade80",
    glow: "rgba(34, 197, 94, 0.3)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    ),
  },
  {
    id: "comms",
    href: "/comms",
    label: "Comms",
    room: "comms",
    color: "#a855f7",
    colorBright: "#c084fc",
    glow: "rgba(168, 85, 247, 0.3)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: "profile",
    href: "/profile",
    label: "Profile",
    room: "profile",
    color: "#e0e4ec",
    colorBright: "#f1f3f8",
    glow: "rgba(224, 228, 236, 0.2)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
  },
];

// Satellite positions around center (angles in degrees, right-side vertical layout)
const POSITIONS = [
  { angle: -90, distance: 64 },  // top
  { angle: -18, distance: 64 },  // top-right
  { angle: 54, distance: 64 },   // bottom-right
  { angle: 126, distance: 64 },  // bottom-left
  { angle: 198, distance: 64 },  // top-left
];

const HIDE_DELAY = 2500; // ms before auto-hiding
const EDGE_ZONE = 48;    // px from right edge to trigger reveal

export default function HexMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showGuideConfirm, setShowGuideConfirm] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { room } = useRoom();
  const menuRef = useRef<HTMLDivElement>(null);
  const sound = useSoundEngine();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Auto-hide logic ---

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setVisible(true);
    hideTimerRef.current = setTimeout(() => {
      // Don't hide if menu is open
      if (!isOpen) setVisible(false);
    }, HIDE_DELAY);
  }, [isOpen]);

  // Show on initial load, start hide timer
  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetHideTimer]);

  // Don't auto-hide while menu is open
  useEffect(() => {
    if (isOpen) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setVisible(true);
    } else {
      resetHideTimer();
    }
  }, [isOpen, resetHideTimer]);

  // Right-edge mouse detection to reveal
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const fromRight = window.innerWidth - e.clientX;
      if (fromRight <= EDGE_ZONE) {
        resetHideTimer();
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [resetHideTimer]);

  // --- Menu interactions ---

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      sound.play(prev ? "menuClose" : "menuOpen");
      return !prev;
    });
    resetHideTimer();
  }, [sound, resetHideTimer]);

  const navigate = useCallback(
    (href: string) => {
      sound.play("roomTransition");
      setIsOpen(false);
      router.push(href);
      resetHideTimer();
    },
    [router, sound, resetHideTimer]
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Keyboard shortcut: backtick to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "`" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  const activeItem = NAV_ITEMS.find((item) => item.room === room);

  return (
    <>
    {/* Edge hint — glowing bar on right edge, vertically centered on menu */}
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        zIndex: 69,
        width: "4px",
        height: "90px",
        borderRadius: "3px 0 0 3px",
        background: `linear-gradient(180deg, transparent 0%, ${activeItem?.color ?? "#06d6d6"} 35%, ${activeItem?.color ?? "#06d6d6"} 65%, transparent 100%)`,
        boxShadow: `0 0 12px ${activeItem?.glow ?? "rgba(6, 214, 214, 0.3)"}, 0 0 24px ${activeItem?.glow ?? "rgba(6, 214, 214, 0.3)"}`,
        opacity: visible ? 0 : 0.85,
        transition: "opacity 0.4s ease",
      }}
    />
    <div
      ref={menuRef}
      className="fixed top-1/2"
      style={{
        zIndex: 70,
        right: "74px",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(-50%) translateX(0)"
          : "translateY(-50%) translateX(20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Satellite hex items */}
      {NAV_ITEMS.map((item, i) => {
        const pos = POSITIONS[i];
        const rad = (pos.angle * Math.PI) / 180;
        const x = Math.cos(rad) * pos.distance;
        const y = Math.sin(rad) * pos.distance;
        const isActive = item.room === room;
        const delay = i * 30;

        return (
          <div
            key={item.id}
            className="absolute group hover:z-[80]"
            style={{
              left: `50%`,
              top: `50%`,
              transform: isOpen
                ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                : `translate(-50%, -50%) scale(0)`,
              opacity: isOpen ? 1 : 0,
              transition: `transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, opacity 0.12s ease ${delay}ms`,
              pointerEvents: isOpen ? "auto" : "none",
            }}
          >
            <button
              onClick={() => navigate(item.href)}
              aria-label={item.label}
              className="hex-menu-item"
              style={{
                background: isActive ? item.color : "rgba(15, 17, 24, 0.9)",
                border: `1.5px solid ${isActive ? item.colorBright : item.color + "40"}`,
                color: isActive ? "#050508" : item.color,
                boxShadow: isActive ? `0 0 20px ${item.glow}` : "none",
              }}
            >
              {item.icon}
            </button>

            {/* Tooltip — positioned to the left so it doesn't go off-screen */}
            <div
              className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
              style={{
                zIndex: 80,
                background: "rgba(10, 11, 16, 0.97)",
                border: `1px solid ${item.color}60`,
                color: item.color,
                fontFamily: "'Chakra Petch', sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "11px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                boxShadow: `0 0 12px ${item.glow}`,
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}

      {/* Central hex trigger */}
      <button
        onClick={toggle}
        aria-label="Navigation menu"
        className="hex-menu-trigger relative"
        style={{
          background: isOpen
            ? "rgba(6, 214, 214, 0.15)"
            : "rgba(15, 17, 24, 0.7)",
          border: `1.5px solid ${isOpen ? "#06d6d6" : "rgba(6, 214, 214, 0.2)"}`,
          transition: "all 0.2s ease",
        }}
      >
        {/* L1NX logo glyph */}
        <svg
          viewBox="0 0 32 32"
          className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(30deg)" : "rotate(0deg)",
          }}
        >
          <path
            d="M16 4L28 12v8L16 28 4 20v-8L16 4z"
            fill="none"
            stroke={activeItem?.color ?? "#06d6d6"}
            strokeWidth="1.5"
            opacity={0.6}
          />
          <path
            d="M16 8L24 13v6L16 24 8 19v-6L16 8z"
            fill="none"
            stroke={activeItem?.color ?? "#06d6d6"}
            strokeWidth="1.2"
            opacity={0.9}
          />
          <circle
            cx="16"
            cy="16"
            r="2.5"
            fill={activeItem?.color ?? "#06d6d6"}
            opacity={0.8}
          />
        </svg>
      </button>

      {/* Guide button — visible when menu is open */}
      <button
        onClick={() => {
          setShowGuideConfirm(true);
          setIsOpen(false);
        }}
        aria-label="Relaunch onboarding guide"
        className="absolute group"
        style={{
          left: "50%",
          top: "calc(50% + 72px)",
          transform: isOpen ? "translate(-50%, 0) scale(1)" : "translate(-50%, 0) scale(0)",
          opacity: isOpen ? 0.7 : 0,
          transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) 150ms, opacity 0.12s ease 150ms",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold hover:opacity-100 transition-opacity"
          style={{
            background: "rgba(15, 17, 24, 0.9)",
            border: "1px solid rgba(6, 214, 214, 0.25)",
            color: "#06d6d6",
          }}
        >
          ?
        </div>
        <div
          className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
          style={{
            background: "rgba(10, 11, 16, 0.95)",
            border: "1px solid rgba(6, 214, 214, 0.3)",
            color: "#06d6d6",
            fontFamily: "'Chakra Petch', sans-serif",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: "10px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Guide
        </div>
      </button>
    </div>

    {/* Guide confirm dialog */}
    {showGuideConfirm && (
      <>
        <div
          className="fixed inset-0"
          style={{ zIndex: 71, background: "rgba(5, 5, 8, 0.6)", backdropFilter: "blur(2px)" }}
          onClick={() => setShowGuideConfirm(false)}
        />
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg max-w-xs w-full"
          style={{
            zIndex: 72,
            background: "rgba(15, 17, 24, 0.95)",
            border: "1px solid rgba(6, 214, 214, 0.25)",
            boxShadow: "0 0 40px rgba(6, 214, 214, 0.08)",
          }}
        >
          <h3
            className="display-font text-sm tracking-wider mb-2"
            style={{ color: "#06d6d6" }}
          >
            Relaunch Guide?
          </h3>
          <p className="text-xs text-v2-text-dim mb-5 leading-relaxed">
            This will restart the onboarding walkthrough from the beginning.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowGuideConfirm(false)}
              className="px-4 py-1.5 text-xs rounded text-v2-text-muted hover:text-v2-text transition-colors"
              style={{ fontFamily: "'Chakra Petch', sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowGuideConfirm(false);
                clearOnboardingFlag();
                if (pathname === "/") {
                  window.location.reload();
                } else {
                  router.push("/");
                }
              }}
              className="px-4 py-1.5 text-xs rounded font-semibold tracking-wider uppercase
                bg-v2-cyan/15 text-v2-cyan border border-v2-cyan/30
                hover:bg-v2-cyan/25 transition-all"
              style={{ fontFamily: "'Chakra Petch', sans-serif" }}
            >
              Launch
            </button>
          </div>
        </div>
      </>
    )}
    </>
  );
}
