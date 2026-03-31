// ═══════════════════════════════════════
// Card Export / Import Utilities
// ═══════════════════════════════════════

export interface ExportedCard {
  cardId: string;
  topicId: string;
  type: string;
  front: string;
  back: string;
  difficulty: number;
  tier: number;
  steps?: string[];
}

export function exportCardsToJSON(cards: ExportedCard[]): string {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    cardCount: cards.length,
    cards: cards.map((c) => ({
      cardId: c.cardId,
      topicId: c.topicId,
      type: c.type,
      front: c.front,
      back: c.back,
      difficulty: c.difficulty,
      tier: c.tier,
      steps: c.steps,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadJSON(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedCards(jsonString: string): { cards: ExportedCard[]; error: string | null } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.cards || !Array.isArray(data.cards)) {
      return { cards: [], error: "Invalid format: expected { cards: [...] }" };
    }
    const valid: ExportedCard[] = [];
    for (const c of data.cards) {
      if (!c.cardId || !c.topicId || !c.front || !c.back) {
        continue; // skip invalid entries
      }
      valid.push({
        cardId: c.cardId,
        topicId: c.topicId,
        type: c.type ?? "easy",
        front: c.front,
        back: c.back,
        difficulty: c.difficulty ?? 1,
        tier: c.tier ?? 1,
        steps: c.steps,
      });
    }
    return { cards: valid, error: null };
  } catch {
    return { cards: [], error: "Failed to parse JSON file." };
  }
}
