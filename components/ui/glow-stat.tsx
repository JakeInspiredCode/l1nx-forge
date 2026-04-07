"use client";

interface GlowStatProps {
  value: string | number;
  label: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function GlowStat({
  value,
  label,
  icon,
  size = "md",
  className = "",
}: GlowStatProps) {
  const valueSize =
    size === "sm" ? "text-lg" : size === "lg" ? "text-4xl" : "text-2xl";
  const labelSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {icon && <span className="text-sm mb-0.5">{icon}</span>}
      <span className={`mono font-bold glow-text-cyan ${valueSize}`}>
        {value}
      </span>
      <span className={`text-v2-text-dim uppercase tracking-wider ${labelSize}`}>
        {label}
      </span>
    </div>
  );
}
