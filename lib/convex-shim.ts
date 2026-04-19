"use client";

// Runtime façade that used to wrap Convex. Now dispatches to the in-memory
// store in lib/data. The name is preserved so existing import sites keep
// working during the strangler migration; all call sites will be moved off
// this shim in a later phase.

import { useCallback, useRef, useSyncExternalStore } from "react";
import { FN_NAME } from "./data/api";
import { subscribe, getVersion, isLive } from "./data/store";
import { queries, mutations } from "./data/operations";

function getFnName(ref: unknown): string {
  if (!ref || typeof ref !== "object") return "";
  const name = (ref as Record<symbol, unknown>)[FN_NAME];
  return typeof name === "string" ? name : "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRef = any;

// Convenience doc-shape types for inline annotations at call sites.
// The real types live in lib/data/schema; these aliases let components cast
// a useQuery result with minimal syntax.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = Record<string, any>;

function serverSnapshot(): undefined {
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQuery<T = AnyDoc>(ref: AnyRef, args?: any): T | undefined {
  const name = getFnName(ref);
  const argsKey = JSON.stringify(args ?? null);
  const cacheRef = useRef<{ key: string; version: number; result: unknown } | null>(null);

  const getSnapshot = () => {
    if (!isLive()) return undefined;
    const v = getVersion();
    const key = name + "|" + argsKey;
    const cached = cacheRef.current;
    if (cached && cached.key === key && cached.version === v) {
      return cached.result;
    }
    const handler = queries[name];
    if (!handler) {
      if (typeof window !== "undefined" && name) {
        console.warn(`[data] no query handler for ${name}`);
      }
      const result = undefined;
      cacheRef.current = { key, version: v, result };
      return result;
    }
    const result = handler((args as Record<string, unknown>) ?? {});
    cacheRef.current = { key, version: v, result };
    return result;
  };

  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot) as T | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMutation(ref: AnyRef): any {
  const name = getFnName(ref);
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args?: any) => {
      const handler = mutations[name];
      if (!handler) {
        if (typeof window !== "undefined") {
          console.warn(`[data] no mutation handler for ${name}`);
        }
        return undefined;
      }
      return handler((args as Record<string, unknown>) ?? {});
    },
    [name],
  );
}
