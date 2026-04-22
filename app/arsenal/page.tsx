"use client";

import { Suspense } from "react";
import Arsenal from "@/components/arsenal/arsenal";

export default function ArsenalPage() {
  return (
    <Suspense fallback={<div className="h-[calc(100vh-56px)] w-full bg-v2-bg-deep" />}>
      <Arsenal />
    </Suspense>
  );
}
