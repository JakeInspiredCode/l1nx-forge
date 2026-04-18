import type { ChapterSection } from "@/lib/types/chapter";
import { HARDWARE_CHAPTERS } from "./hardware-chapters";
import { NETWORKING_CHAPTERS } from "./networking-chapters";
import { OPS_CHAPTERS } from "./ops-chapters";

const ALL_CHAPTERS: ChapterSection[] = [...HARDWARE_CHAPTERS, ...NETWORKING_CHAPTERS, ...OPS_CHAPTERS];

const BY_ID: Record<string, ChapterSection> = Object.fromEntries(
  ALL_CHAPTERS.map((s) => [s.id, s])
);

export function getChapterSection(id: string): ChapterSection | null {
  return BY_ID[id] ?? null;
}

export function hasChapterSection(id: string): boolean {
  return id in BY_ID;
}

export { ALL_CHAPTERS };
