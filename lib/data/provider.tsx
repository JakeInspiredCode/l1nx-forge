"use client";

import { useEffect, type ReactNode } from "react";
import { installPersistence } from "./persistence";
import { seedIfEmpty } from "./seed";
import { goLive } from "./store";

export default function DataProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    installPersistence();
    seedIfEmpty();
    goLive();
  }, []);
  return <>{children}</>;
}
