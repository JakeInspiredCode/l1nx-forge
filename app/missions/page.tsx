import { Suspense } from "react";
import SystemMap from "@/components/system-map/system-map";

export default function MissionsPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-v2-bg-deep" />}>
      <SystemMap />
    </Suspense>
  );
}
