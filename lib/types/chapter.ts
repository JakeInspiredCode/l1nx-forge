import type { TopicId } from "../types";

export type TableCell = string | { code: string };

export type CalloutVariant = "info" | "warning" | "troubleshooting";

export interface CollapsibleItem {
  title: string;
  body: string;
  color?: string;
}

export interface FillBlankSlot {
  answer: string;
  alternates?: string[];
  hint?: string;
}

export interface FlipCardItem {
  front: string;
  back: string;
}

export interface InlineChoice {
  label: string;
  text: string;
}

export type Block =
  | { kind: "heading"; level: 2 | 3; text: string; subtitle?: string }
  | { kind: "prose"; html: string }
  | { kind: "code"; label?: string; language?: string; code: string }
  | { kind: "table"; headers: string[]; rows: TableCell[][] }
  | { kind: "bullets"; items: string[] }
  | { kind: "callout"; variant: CalloutVariant; title?: string; body: string }
  | { kind: "why-this-matters"; body: string }
  | { kind: "think-about-it"; scenario: string; hint?: string; answer: string }
  | { kind: "knowledge-check"; question: string; answer: string }
  | { kind: "collapsible"; intro?: string; items: CollapsibleItem[] }
  | { kind: "fill-blank"; prompt: string; sentence: string; blanks: FillBlankSlot[]; reveal: string }
  | { kind: "flip-cards"; intro?: string; cards: FlipCardItem[] }
  | { kind: "mcq-inline"; question: string; choices: InlineChoice[]; correctAnswer: string; explanation: string }
  | { kind: "custom-component"; id: string; props?: Record<string, unknown> };

export interface ChapterSection {
  id: string;
  topicId: TopicId;
  title: string;
  subtitle?: string;
  icon?: string;
  estimatedMinutes: number;
  blocks: Block[];
}
