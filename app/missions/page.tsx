import { Suspense } from "react";
import SystemMap from "@/components/system-map/system-map";

export default function MissionsPage() {
  return (
    <Suspense fallback={<div className="h-[calc(100vh-48px)] w-full bg-v2-bg-deep" />}>
      <SystemMap />
    </Suspense>
  );
}
