"use client";

import { useEffect, type ReactNode } from "react";
import { installPersistence } from "./persistence";
import { seedIfEmpty } from "./seed";
import { seedDemoIfEmpty } from "./demo-seed";
import { goLive } from "./store";

const DEMO_MODE = process.env.NEXT_PUBLIC_L1NX_DEMO_MODE === "1";

export default function DataProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    installPersistence();
    seedIfEmpty();
    if (DEMO_MODE) {
      seedDemoIfEmpty();
    }
    goLive();
  }, []);
  return <>{children}</>;
}
