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
      {/* Outermost corona — warm glow */}
      <circle
        cx={cx}
        cy={cy}
        r={130}
        fill={`url(#star-outer-corona)`}
        opacity={0.6}
        className="animate-[coronaFlicker_5s_ease-in-out_infinite]"
      />

      {/* Mid corona — fire ring */}
      <circle
        cx={cx}
        cy={cy}
        r={90}
        fill={`url(#star-mid-corona)`}
        opacity={0.7}
        className="animate-[coronaFlicker_3.5s_ease-in-out_infinite]"
      />

      {/* Inner corona glow */}
      <circle
        cx={cx}
        cy={cy}
        r={60}
        fill={`url(#star-corona)`}
        className="animate-[coronaFlicker_3s_ease-in-out_infinite]"
      />

      {/* Inner glow */}
      <circle cx={cx} cy={cy} r={38} fill={`url(#star-inner)`} />

      {/* Pulsing ring decoration */}
      <circle
        cx={cx}
        cy={cy}
        r={50}
        fill="none"
        stroke={color}
        strokeWidth={0.8}
        opacity={0.2}
        className="animate-[availablePulse_3s_ease-in-out_infinite]"
      />

      {/* Core — radial gradient from white to campaign color */}
      <circle
        cx={cx}
        cy={cy}
        r={22}
        fill={`url(#star-core)`}
        style={{ filter: `drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color}80)` }}
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
        y={cy + 44}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={color}
        fontSize={10}
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight={600}
        letterSpacing="0.15em"
        className="pointer-events-none select-none uppercase"
        style={{ textShadow: `0 0 10px ${color}40` }}
      >
        {title}
      </text>

      {/* Gradient definitions */}
      <defs>
        {/* Outermost warm corona */}
        <radialGradient id="star-outer-corona" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6600" stopOpacity={0.08} />
          <stop offset="30%" stopColor="#ff3300" stopOpacity={0.04} />
          <stop offset="60%" stopColor={color} stopOpacity={0.02} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>

        {/* Mid corona — orange/fire tones */}
        <radialGradient id="star-mid-corona" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffaa00" stopOpacity={0.2} />
          <stop offset="30%" stopColor="#ff6600" stopOpacity={0.1} />
          <stop offset="60%" stopColor={color} stopOpacity={0.04} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>

        {/* Inner corona */}
        <radialGradient id="star-corona" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffdd44" stopOpacity={0.35} />
          <stop offset="30%" stopColor="#ffaa00" stopOpacity={0.15} />
          <stop offset="60%" stopColor={color} stopOpacity={0.06} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>

        {/* Inner glow */}
        <radialGradient id="star-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
          <stop offset="30%" stopColor="#ffdd44" stopOpacity={0.2} />
          <stop offset="70%" stopColor={color} stopOpacity={0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>

        {/* Core gradient — white center through yellow to campaign color */}
        <radialGradient id="star-core" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="30%" stopColor="#ffee88" stopOpacity={0.8} />
          <stop offset="60%" stopColor="#ffaa00" stopOpacity={0.7} />
          <stop offset="100%" stopColor={color} stopOpacity={0.9} />
        </radialGradient>
      </defs>
    </g>
  );
}
