"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

export const DEMO_MODE = !process.env.NEXT_PUBLIC_CONVEX_URL;

// In demo mode, use a placeholder URL. The client won't connect,
// so useQuery returns undefined (hooks already fallback with ?? [] / ?? null)
// and useMutation calls silently fail. The app stays fully navigable.
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"
);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
