"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { TOPICS } from "@/lib/types";

interface ProgressEntry {
  topicId: string;
  masteryPercent: number;
  [key: string]: unknown;
}

interface ReadinessRadarProps {
  progress: ProgressEntry[];
}

export default function ReadinessRadar({ progress }: ReadinessRadarProps) {
  const data = TOPICS.map((topic) => {
    const tp = progress.find((p) => p.topicId === topic.id);
    const mastery = tp?.masteryPercent ?? 0;
    const isWeak = mastery < 85;
    return {
      topic: topic.name.split(" ")[0],
      mastery,
      weakMastery: isWeak ? mastery : 0,
      fullMark: 100,
    };
  });

  // Center score: Linux weighted 2x per build plan
  const weightedScore = (() => {
    let totalWeight = 0;
    let weightedSum = 0;
    for (const topic of TOPICS) {
      const tp = progress.find((p) => p.topicId === topic.id);
      const mastery = tp?.masteryPercent ?? 0;
      const weight = topic.id === "linux" ? 2 : 1;
      weightedSum += mastery * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  })();

  // Custom tick: red label for weak axes, default gray for strong
  const renderAxisTick = (props: { payload: { value: string }; x: number; y: number; textAnchor: string }) => {
    const { payload, x, y, textAnchor } = props;
    const entry = data.find((d) => d.topic === payload.value);
    const isWeak = entry && entry.mastery < 85 && entry.mastery > 0;
    return (
      <text x={x} y={y} textAnchor={textAnchor as "start" | "middle" | "end"}
        fill={isWeak ? "#ef4444" : "#888888"} fontSize={11}
        fontFamily="'JetBrains Mono', monospace" fontWeight={isWeak ? 600 : 400}>
        {payload.value}
      </text>
    );
  };

  return (
    <div className="bg-forge-surface border border-forge-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Readiness Radar</h2>
        <div className="text-right">
          <span className={`text-2xl font-bold mono ${
            weightedScore >= 85 ? "text-forge-success" :
            weightedScore >= 50 ? "text-forge-warning" :
            "text-forge-text-dim"
          }`}>{weightedScore}%</span>
          <span className="block text-xs text-forge-text-dim">weighted overall</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#222222" />
          <PolarAngleAxis dataKey="topic" tick={renderAxisTick} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          {/* Base layer — blue for all axes */}
          <Radar name="Mastery" dataKey="mastery"
            stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
          {/* Weak overlay — red for axes below 85% */}
          <Radar name="Weak" dataKey="weakMastery"
            stroke="#ef4444" fill="#ef4444" fillOpacity={0.12} strokeWidth={1.5}
            dot={false} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
