"use client";

interface ScanOverlayProps {
  className?: string;
}

export default function ScanOverlay({ className = "" }: ScanOverlayProps) {
  return (
    <div
      className={`absolute inset-0 scan-lines z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
