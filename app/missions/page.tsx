import { Suspense } from "react";
import SystemMap from "@/components/system-map/system-map";
import MissionsLoading from "./loading";

export default function MissionsPage() {
  return (
    <Suspense fallback={<MissionsLoading />}>
      <SystemMap />
    </Suspense>
  );
}
