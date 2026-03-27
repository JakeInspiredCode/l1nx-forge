import { ForgeCard } from "../types";
import linux from "./linux";
import linuxT1Continued from "./linux-t1b";
import { linuxT2, linuxT3, linuxT4 } from "./linux-advanced";
import { hardware, networking, fiber, powerCooling, opsProcesses, xaiContext, behavioral } from "./topics";

export function getAllSeedCards(): ForgeCard[] {
  return [
    ...linux,
    ...linuxT1Continued,
    ...linuxT2,
    ...linuxT3,
    ...linuxT4,
    ...hardware,
    ...networking,
    ...fiber,
    ...powerCooling,
    ...opsProcesses,
    ...xaiContext,
    ...behavioral,
  ];
}

export function seedDatabase(setCards: (cards: ForgeCard[]) => void, isSeeded: () => boolean, markSeeded: () => void) {
  if (isSeeded()) return false;
  const cards = getAllSeedCards();
  setCards(cards);
  markSeeded();
  return true;
}
