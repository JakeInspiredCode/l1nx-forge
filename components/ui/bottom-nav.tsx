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
const LINE_Y = 28;
const WAVE = 7; // pronounced flowing wave

// Radiant spike lines around a node
const INACTIVE_SPIKES = 6;
const ACTIVE_SPIKES = 10;

function spikeLines(
  cx: number, cy: number, count: number,
  innerR: number, outerR: number, offsetDeg = 0,
): string[] {
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    const angle = ((360 / count) * i + offsetDeg) * (Math.PI / 180);
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * outerR;
    const y2 = cy + Math.sin(angle) * outerR;
    lines.push(`M${x1},${y1} L${x2},${y2}`);
  }
  return lines;
}

// Node x positions — tight grouping, centered
function nodePositions(count: number): number[] {
  const pad = 60;
  const spacing = (VB_W - pad * 2) / (count - 1);
  return Array.from({ length: count }, (_, i) => pad + i * spacing);
}

// Y offset for a node riding the wave (alternating up/down)
function nodeY(i: number): number {
  return LINE_Y + (i % 2 === 0 ? -WAVE * 0.4 : WAVE * 0.4);
}

// Build a smooth flowing quadratic wave — visible organic curve
function buildStreamPath(xs: number[]): string {
  const y = LINE_Y;
  let d = `M 0,${y}`;
  // Lead-in curve to first node
  d += ` Q ${xs[0] * 0.5},${y - WAVE * 0.3} ${xs[0]},${nodeY(0)}`;
  // Flowing quadratic curves through each segment
  for (let i = 0; i < xs.length - 1; i++) {
    const midX = (xs[i] + xs[i + 1]) / 2;
    const dir = i % 2 === 0 ? 1 : -1;
    d += ` Q ${midX},${y + WAVE * dir} ${xs[i + 1]},${nodeY(i + 1)}`;
  }
  // Lead-out
  const last = xs[xs.length - 1];
  const lastI = xs.length - 1;
  d += ` Q ${last + (VB_W - last) * 0.5},${nodeY(lastI) + WAVE * 0.3} ${VB_W},${y}`;
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
          <filter id="spike-glow">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          {/* Radial gradient for active node core */}
          <radialGradient id="active-core-grad">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
            <stop offset="35%" stopColor="#06d6d6" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#06d6d6" stopOpacity={0} />
          </radialGradient>
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
          strokeWidth={1.5}
          strokeLinecap="round"
        />

        {/* Decorative starburst nodes — ride the wave */}
        {NAV_ITEMS.map((item, i) => {
          const isActive = activePage === item.id;
          const x = xs[i];
          const y = nodeY(i);

          if (isActive) {
            // ── Active node: prominent radiant starburst ──
            const outerSpikes = spikeLines(x, y, ACTIVE_SPIKES, 4.5, 11);
            const innerSpikes = spikeLines(x, y, ACTIVE_SPIKES, 3, 7, 360 / ACTIVE_SPIKES / 2);
            return (
              <g key={item.id}>
                {/* Deep glow halo */}
                <circle cx={x} cy={y} r={16} fill="#06d6d6" opacity={0.06} filter="url(#stream-blur)">
                  <animate attributeName="r" values="14;18;14" dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Outer radiant spikes — glow layer */}
                <g filter="url(#spike-glow)" opacity={0.5}>
                  {outerSpikes.map((d, si) => (
                    <path key={`og${si}`} d={d} stroke="#06d6d6" strokeWidth={0.8} strokeLinecap="round" />
                  ))}
                </g>
                {/* Outer radiant spikes — crisp */}
                <g className="nav-node-breathe">
                  {outerSpikes.map((d, si) => (
                    <path key={`oc${si}`} d={d} stroke="#06d6d6" strokeWidth={0.6} strokeLinecap="round" opacity={0.8} />
                  ))}
                </g>
                {/* Inner half-spikes — offset rotation for density */}
                <g className="nav-node-breathe" opacity={0.5}>
                  {innerSpikes.map((d, si) => (
                    <path key={`ic${si}`} d={d} stroke="#06d6d6" strokeWidth={0.4} strokeLinecap="round" />
                  ))}
                </g>
                {/* Ring */}
                <circle cx={x} cy={y} r={3.5} fill="none" stroke="#06d6d6" strokeWidth={0.6} opacity={0.6} />
                {/* Core dot — white-hot center */}
                <circle cx={x} cy={y} r={2.8} fill="url(#active-core-grad)"
                  style={{ filter: "drop-shadow(0 0 6px rgba(6,214,214,0.8)) drop-shadow(0 0 14px rgba(6,214,214,0.3))" }}
                />
                {/* Label */}
                <text x={x} y={y + 16} textAnchor="middle" dominantBaseline="hanging"
                  fill="#e0e4ec" fontSize={9} fontFamily="'JetBrains Mono', monospace"
                  fontWeight={600} letterSpacing="0.1em"
                  className="pointer-events-none select-none uppercase"
                  style={{ textShadow: "0 0 8px rgba(6, 214, 214, 0.3)" }}
                >{item.label}</text>
                {/* Click target */}
                <a href={item.href}>
                  <rect x={x - 50} y={0} width={100} height={VB_H} fill="transparent" className="cursor-pointer" />
                </a>
              </g>
            );
          }

          // ── Inactive node: subtle starburst ──
          const spikes = spikeLines(x, y, INACTIVE_SPIKES, 3, 6.5);
          return (
            <g key={item.id}>
              {/* Radiant spikes — dim */}
              <g opacity={0.25}>
                {spikes.map((d, si) => (
                  <path key={`s${si}`} d={d} stroke="#06d6d6" strokeWidth={0.4} strokeLinecap="round" />
                ))}
              </g>
              {/* Core dot */}
              <circle cx={x} cy={y} r={2} fill="#1e2235" stroke="#06d6d6" strokeWidth={0.4} opacity={0.4} />
              {/* Label */}
              <text x={x} y={y + 14} textAnchor="middle" dominantBaseline="hanging"
                fill="#3a4258" fontSize={9} fontFamily="'JetBrains Mono', monospace"
                fontWeight={500} letterSpacing="0.1em"
                className="pointer-events-none select-none uppercase nav-label-dim"
              >{item.label}</text>
              {/* Hover brightener — covers spikes + dot area */}
              <circle cx={x} cy={y} r={4} fill="#06d6d6" opacity={0} className="nav-hover-dot" />
              {/* Click target */}
              <a href={item.href} className="nav-tab-hover">
                <rect x={x - 50} y={0} width={100} height={VB_H} fill="transparent" className="cursor-pointer" />
              </a>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
