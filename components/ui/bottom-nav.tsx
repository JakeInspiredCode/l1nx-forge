"use client";

import Link from "next/link";

interface BottomNavProps {
  activePage: string;
}

const NAV_ITEMS = [
  { id: "galaxy-map", href: "/", label: "Sector View" },
  { id: "missions", href: "/missions", label: "Missions" },
  { id: "battle-station", href: "/battle-station", label: "Battle Station" },
  { id: "resources", href: "/arsenal", label: "Resources" },
  { id: "profile", href: "/profile", label: "Profile" },
];

// SVG viewBox width and vertical center
const VB_W = 700;
const VB_H = 56;
const LINE_Y = 20;

// Node x positions — tight grouping, centered
function nodePositions(count: number): number[] {
  const pad = 60;
  const spacing = (VB_W - pad * 2) / (count - 1);
  return Array.from({ length: count }, (_, i) => pad + i * spacing);
}

// Build a smooth flowing bezier — gentle organic wave
function buildStreamPath(xs: number[]): string {
  const y = LINE_Y;
  const wave = 2.5; // very subtle wave
  let d = `M 0,${y}`;
  // Smooth lead-in
  d += ` Q ${xs[0] * 0.5},${y - wave * 0.5} ${xs[0]},${y}`;
  // Flowing curves through nodes
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i];
    const x1 = xs[i + 1];
    const cp1x = x0 + (x1 - x0) * 0.4;
    const cp2x = x0 + (x1 - x0) * 0.6;
    const dir = i % 2 === 0 ? -1 : 1;
    d += ` C ${cp1x},${y + wave * dir} ${cp2x},${y - wave * dir} ${x1},${y}`;
  }
  // Smooth lead-out
  const last = xs[xs.length - 1];
  d += ` Q ${last + (VB_W - last) * 0.5},${y + wave * 0.5} ${VB_W},${y}`;
  return d;
}

export default function BottomNav({ activePage }: BottomNavProps) {
  const xs = nodePositions(NAV_ITEMS.length);
  const streamPath = buildStreamPath(xs);

  return (
    <div className="energy-nav">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          {/* Gradient that fades to transparent at edges */}
          <linearGradient id="stream-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06d6d6" stopOpacity={0} />
            <stop offset="12%" stopColor="#06d6d6" stopOpacity={0.4} />
            <stop offset="50%" stopColor="#06d6d6" stopOpacity={0.5} />
            <stop offset="88%" stopColor="#06d6d6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#06d6d6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="stream-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06d6d6" stopOpacity={0} />
            <stop offset="15%" stopColor="#06d6d6" stopOpacity={0.15} />
            <stop offset="50%" stopColor="#06d6d6" stopOpacity={0.2} />
            <stop offset="85%" stopColor="#06d6d6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#06d6d6" stopOpacity={0} />
          </linearGradient>
          <filter id="stream-blur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Glow layer — blurred duplicate behind */}
        <path
          d={streamPath}
          fill="none"
          stroke="url(#stream-glow-grad)"
          strokeWidth={6}
          filter="url(#stream-blur)"
        />

        {/* Main energy line */}
        <path
          d={streamPath}
          fill="none"
          stroke="url(#stream-grad)"
          strokeWidth={1.2}
          strokeLinecap="round"
        />

        {/* Node dots and labels */}
        {NAV_ITEMS.map((item, i) => {
          const isActive = activePage === item.id;
          const x = xs[i];
          return (
            <g key={item.id}>
              {/* Active node glow */}
              {isActive && (
                <circle
                  cx={x} cy={LINE_Y} r={10}
                  fill="#06d6d6" opacity={0.08}
                  className="nav-node-breathe"
                />
              )}
              {/* Node dot */}
              <circle
                cx={x} cy={LINE_Y}
                r={isActive ? 4 : 2.5}
                fill={isActive ? "#06d6d6" : "#4a5268"}
                className={isActive ? "nav-node-breathe" : ""}
                style={isActive ? { filter: "drop-shadow(0 0 8px #06d6d6) drop-shadow(0 0 16px rgba(6,214,214,0.3))" } : undefined}
              />
              {/* Label */}
              <text
                x={x}
                y={LINE_Y + 18}
                textAnchor="middle"
                dominantBaseline="hanging"
                fill={isActive ? "#e0e4ec" : "#3a4258"}
                fontSize={9.5}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight={isActive ? 600 : 400}
                letterSpacing="0.1em"
                className={`pointer-events-none select-none uppercase ${!isActive ? "nav-label-dim" : ""}`}
                style={isActive ? { textShadow: "0 0 8px rgba(6, 214, 214, 0.3)" } : undefined}
              >
                {item.label}
              </text>
              {/* Node dot for hover (hidden, brightens on hover) */}
              {!isActive && (
                <circle
                  cx={x} cy={LINE_Y} r={3.5}
                  fill="#06d6d6" opacity={0}
                  className="nav-hover-dot"
                />
              )}
              {/* Invisible click target */}
              <a href={item.href} className={!isActive ? "nav-tab-hover" : ""}>
                <rect
                  x={x - 50} y={0}
                  width={100} height={VB_H}
                  fill="transparent"
                  className="cursor-pointer"
                />
              </a>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
