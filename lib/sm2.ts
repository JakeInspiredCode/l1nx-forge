import { ForgeCard, Quality } from "./types";

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string;
}

export function sm2(
  card: Pick<ForgeCard, "easeFactor" | "interval" | "repetitions">,
  quality: Quality,
  responseTime: number
): SM2Result {
  let q = quality as number;

  // Latency penalty: rated Good/Easy but took >15s => downgrade to Hard
  if (q >= 4 && responseTime > 15000) {
    q = 3;
  }

  let { easeFactor, interval, repetitions } = card;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + interval);
  const dueDate = due.toISOString().split("T")[0];

  return { easeFactor, interval, repetitions, dueDate };
}

export function isCardDue(card: ForgeCard): boolean {
  const today = new Date().toISOString().split("T")[0];
  return card.dueDate <= today;
}

export function sortByPriority(cards: ForgeCard[]): ForgeCard[] {
  const today = new Date().toISOString().split("T")[0];
  return [...cards].sort((a, b) => {
    const aOver = a.dueDate < today ? 1 : 0;
    const bOver = b.dueDate < today ? 1 : 0;
    if (bOver !== aOver) return bOver - aOver;
    if (b.difficulty !== a.difficulty) return b.difficulty - a.difficulty;
    return a.easeFactor - b.easeFactor;
  });
}
