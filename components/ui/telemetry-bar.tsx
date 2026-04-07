"use client";

interface TelemetryBarProps {
  value: number;       // 0-100
  segments?: number;   // how many visual segments (default 10)
  label?: string;
  color?: "cyan" | "warning" | "danger" | "success";
  className?: string;
}

const colorMap = {
  cyan: "bg-v2-cyan",
  warning: "bg-v2-warning",
  danger: "bg-v2-danger",
  success: "bg-v2-success",
};

const dimColorMap = {
  cyan: "bg-v2-cyan/10",
  warning: "bg-v2-warning/10",
  danger: "bg-v2-danger/10",
  success: "bg-v2-success/10",
};

export default function TelemetryBar({
  value,
  segments = 10,
  label,
  color = "cyan",
  className = "",
}: TelemetryBarProps) {
  const filledSegments = Math.round((value / 100) * segments);

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-v2-text-dim">{label}</span>
          <span className="text-xs mono text-v2-text-dim">{Math.round(value)}%</span>
        </div>
      )}
      <div className="flex gap-0.5">
        {Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-sm transition-colors duration-300 ${
              i < filledSegments ? colorMap[color] : dimColorMap[color]
            }`}
          />
        ))}
      </div>
    </div>
  );
}
