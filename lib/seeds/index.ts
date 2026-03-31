import { ForgeCard } from "../types";
import linux from "./linux";
import { linuxT2, linuxT3, linuxT4, linuxGotchas } from "./linux-advanced";
import { hardware, networking, fiber, powerCooling, opsProcesses, scaleContext, behavioral } from "./topics";

export function getAllSeedCards(): ForgeCard[] {
  return [
    ...linux,
    ...linuxT2,
    ...linuxT3,
    ...linuxT4,
    ...linuxGotchas,
    ...hardware,
    ...networking,
    ...fiber,
    ...powerCooling,
    ...opsProcesses,
    ...scaleContext,
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
