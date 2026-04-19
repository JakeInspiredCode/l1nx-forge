"use client";

import { ENTITY_KEYS, type State } from "./schema";
import { getState, onChange, replaceState } from "./store";

const PREFIX = "l1nx:data:";
const FLUSH_DEBOUNCE_MS = 400;

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

// Read all entity slices from localStorage and merge into store.
// Missing or corrupt slices are ignored.
export function hydrate(): boolean {
  if (!isBrowser()) return false;
  const patch: Partial<State> = {};
  let any = false;
  for (const key of ENTITY_KEYS) {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        patch[key] = parsed;
        any = true;
      }
    } catch {
      window.localStorage.removeItem(PREFIX + key);
    }
  }
  if (any) replaceState(patch);
  return any;
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingState: State | null = null;

function flushNow() {
  if (!isBrowser() || !pendingState) return;
  const snap = pendingState;
  pendingState = null;
  for (const key of ENTITY_KEYS) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(snap[key]));
    } catch (err) {
      console.warn(`[data] flush failed for ${key}:`, err);
    }
  }
}

function queueFlush(next: State) {
  if (!isBrowser()) return;
  pendingState = next;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushNow, FLUSH_DEBOUNCE_MS);
}

let installed = false;
export function installPersistence(): void {
  if (installed || !isBrowser()) return;
  installed = true;
  hydrate();
  onChange(queueFlush);
  // Flush on unload so recent edits survive a hard refresh.
  window.addEventListener("beforeunload", () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      pendingState = getState();
      flushNow();
    }
  });
}

export function resetPersistedData(): void {
  if (!isBrowser()) return;
  for (const key of ENTITY_KEYS) {
    window.localStorage.removeItem(PREFIX + key);
  }
}
