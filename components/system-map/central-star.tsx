"use client";

interface CentralStarProps {
  cx: number;
  cy: number;
  icon: string;
  title: string;
  color: string;
}

export default function CentralStar({ cx, cy, icon, title, color }: CentralStarProps) {
  return (
    <g>
      {/* Outer corona glow */}
      <circle
        cx={cx}
        cy={cy}
        r={70}
        fill={`url(#star-corona)`}
        className="animate-[ambientGlow_3s_ease-in-out_infinite]"
      />

      {/* Inner glow */}
      <circle cx={cx} cy={cy} r={38} fill={`url(#star-inner)`} />

      {/* Core */}
      <circle
        cx={cx}
        cy={cy}
        r={22}
        fill={color}
        opacity={0.9}
        style={{ filter: `drop-shadow(0 0 16px ${color})` }}
      />

      {/* Icon */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        className="pointer-events-none select-none"
      >
        {icon}
      </text>

      {/* Campaign title below star */}
      <text
        x={cx}
        y={cy + 40}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={color}
        fontSize={10}
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight={600}
        letterSpacing="0.15em"
        className="pointer-events-none select-none uppercase"
      >
        {title}
      </text>

      {/* Gradient definitions */}
      <defs>
        <radialGradient id="star-corona" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="40%" stopColor={color} stopOpacity={0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="star-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="70%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
    </g>
  );
}
