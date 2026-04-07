"use client";

import { useState, useEffect, useRef } from "react";

interface XpCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  className?: string;
}

export default function XpCounter({
  target,
  duration = 1500,
  prefix = "+",
  className = "",
}: XpCounterProps) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (target <= 0) return;

    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return (
    <span className={`mono font-bold glow-text-cyan ${className}`}>
      {prefix}{value}
    </span>
  );
}
