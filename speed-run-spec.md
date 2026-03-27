# Colossus Forge — Speed Run Game Mode Spec

---

## Overview

Speed Run is a timed game mode where the player answers flashcard questions by **typing** their responses — not selecting from a list. This forces active recall and catches syntax errors in commands, flags, and paths. The game layer wraps the existing flashcard engine: every card answered counts as a real SM-2 review.

---

## Core Mechanic

The player starts with a **60-second clock**. Cards are presented one at a time (front only). The player types their answer and submits. A scoring engine evaluates the response and awards points + time based on accuracy. The game ends when the clock hits zero.

### Clock Rules

| Event | Time Effect |
|---|---|
| Correct answer | +5 seconds |
| Partial answer (>50% match) | +2 seconds |
| Wrong answer | -3 seconds (penalty) |
| Streak bonus (3+ consecutive correct) | +2 seconds bonus on top of correct reward |

Starting time is configurable: 60s (default), 90s (practice), 45s (hard mode).

### Combo System

Consecutive correct answers build a combo multiplier:

| Streak | Multiplier |
|---|---|
| 0-2 correct | 1x |
| 3-5 correct | 1.5x |
| 6-9 correct | 2x |
| 10+ correct | 3x |

Any wrong answer resets the combo to 0. Partial answers do **not** break the streak but do not advance it either.

---

## Answer Evaluation

This is the critical piece. The player types freeform text. The evaluator must handle commands, definitions, and conceptual answers differently.

### Card Types and Evaluation Strategy

**Command cards** (card `back` field starts with a backtick or contains a code block):

The evaluator extracts the primary command from the card's `back` field and compares it against the player's input using these rules:

1. **Exact match** — full points. Whitespace normalization (trim, collapse multiple spaces).
2. **Core command correct, flags in different order** — full points. `ls -la` and `ls -al` are equivalent.
3. **Core command correct, missing optional flags** — partial credit. Player typed `find /var/log -mtime -1`, answer includes `-type f` too — core logic is right, flag omission is minor.
4. **Core command wrong** — zero points. `ls` when the answer is `df -h` is a miss regardless of flags.
5. **Typo tolerance** — Levenshtein distance of 1 on the base command name is forgiven (e.g., `grpe` → `grep`). Flag typos are not forgiven since precision matters.

Implementation approach:
```typescript
interface CommandEvalResult {
  score: 'correct' | 'partial' | 'wrong';
  baseCommandMatch: boolean;
  flagsMatch: boolean;
  missingFlags: string[];
  extraFlags: string[];
  feedback: string; // e.g., "Missing flag: -type f"
}

function evaluateCommand(userInput: string, expectedAnswer: string): CommandEvalResult
```

Parse both strings into `{ command, flags[], args[] }`. Compare command name (with typo tolerance), then flags (order-insensitive), then arguments (path matching).

**Definition/concept cards** (no code block in `back`):

Use keyword extraction from the card's `back` field. Identify 3-5 key terms that must appear in a correct answer.

1. **All key terms present** — correct.
2. **>50% key terms present** — partial.
3. **<50% key terms** — wrong.

Keyword matching should be case-insensitive and handle common synonyms (e.g., "directory" / "folder", "remove" / "delete").

```typescript
interface KeywordEvalResult {
  score: 'correct' | 'partial' | 'wrong';
  matchedKeywords: string[];
  missedKeywords: string[];
  feedback: string;
}

function evaluateKeywords(userInput: string, expectedAnswer: string): KeywordEvalResult
```

**Fallback for ambiguous cards:**

If the evaluator has low confidence (e.g., scenario cards with long prose answers), show the expected answer and let the player self-grade: "Were you right?" with Yes / Mostly / No buttons. This feeds into scoring as correct / partial / wrong. Only use self-grade as fallback — typed evaluation should handle 80%+ of Tier 1-2 cards automatically.

---

## Card Selection

Speed Run pulls cards from the player's **unlocked tiers** for the selected topic (or all topics for "Mixed" mode), filtered by the selected **card type(s)**. Card selection within the filtered pool is weighted:

| Priority | Weight | Rationale |
|---|---|---|
| Due cards (overdue first) | 3x | Reinforcement when it matters most |
| Weak cards (ease < 2.0) | 2x | Target weak spots |
| New cards from current tier | 1x | Introduce new material |

Exclude Tier 4 branching cards — they require multi-step interaction that doesn't fit the speed format.

Cards are pre-loaded into a shuffled queue of 50 at game start. The player works through as many as the clock allows.

---

## SM-2 Integration

Every card answered in Speed Run feeds the SM-2 engine as a real review. The quality mapping:

| Speed Run Result | SM-2 Quality | Meaning |
|---|---|---|
| Correct (auto-eval) | 4 (Good) | Solid recall under pressure |
| Correct (self-grade Yes) | 4 (Good) | Same |
| Partial (auto-eval) | 3 (Hard) | Knew it but missed details |
| Partial (self-grade Mostly) | 3 (Hard) | Same |
| Wrong (auto-eval) | 1 (Again) | Failed recall |
| Wrong (self-grade No) | 1 (Again) | Same |

The latency penalty from the main SM-2 spec does **not** apply in Speed Run — the entire mode is time-pressured by design, so penalizing thinking time would be redundant.

Response time per card is still recorded in `forgeReviews` for analytics.

---

## UI Layout

### Game Screen

```
┌─────────────────────────────────────────────────┐
│  ⏱ 00:47          COMBO: 5x (2.0x)    ⚡ 340   │  ← Timer | Combo streak + multiplier | Points
├─────────────────────────────────────────────────┤
│                                                 │
│   What command shows mounted filesystems        │
│   with their types and disk usage?              │  ← Card front (markdown rendered)
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   > df -hT_                                     │  ← Text input (monospace, terminal-style)
│                                                 │
│                          [Submit] or Enter       │
├─────────────────────────────────────────────────┤
│   Cards: 12/50    ████████░░░░░░ Correct: 83%   │  ← Progress bar + accuracy
└─────────────────────────────────────────────────┘
```

### Feedback Flash (after submit)

On correct: green flash + "+15 pts" + "+5s" floats up from the timer. Card slides out left, next enters from right.

On partial: amber flash + "+8 pts" + "+2s". Show missed elements briefly (e.g., "Missing: `-T` flag") for 1.5 seconds, then advance.

On wrong: red flash + the correct answer displayed for 2 seconds. "-3s" pulses on the timer. Then advance.

Self-grade fallback: expected answer expands below the input. Three buttons appear: "Nailed It" / "Close" / "Missed It". No timer pause — the clock keeps running, adding pressure to self-grade quickly.

### Game Over Screen

```
┌─────────────────────────────────────────────────┐
│                  SPEED RUN COMPLETE              │
│                                                  │
│   ⚡ 520 points          🔥 Best streak: 8      │
│   Cards: 18              Correct: 14 (78%)       │
│   Avg response: 3.2s     Tier breakdown:         │
│                           T1: 10/12 (83%)        │
│                           T2: 4/6 (67%)          │
│                                                  │
│   ▸ Missed Cards                                 │  ← Expandable: shows front + correct answer
│     linux-014: grep (you typed: grpe -r)         │     for every wrong/partial card
│     linux-028: df -hT (you typed: df -h)         │
│                                                  │
│   [Review Misses]  [Play Again]  [Dashboard]     │
├─────────────────────────────────────────────────┤
│   HIGH SCORES                                    │
│   1. 780 pts — Mar 25 (22 cards, 91%)           │
│   2. 520 pts — Mar 27 (18 cards, 78%)  ← NEW   │
│   3. 410 pts — Mar 24 (15 cards, 73%)           │
└─────────────────────────────────────────────────┘
```

"Review Misses" enters the standard flashcard review mode with only the missed cards queued — immediate remediation.

---

## Points Calculation

```
Base points per card:
  Tier 1 correct: 10
  Tier 2 correct: 20
  Tier 3 correct: 30
  Partial (any tier): half base points

Final points = base × combo multiplier

Bonus points:
  +50 for completing all 50 cards (ran through the whole queue)
  +25 for 90%+ accuracy
  +25 for best streak >= 10
```

Points from Speed Run add to the player's `forgeProfile.totalPoints` (same pool as standard review points).

---

## Convex Schema Addition

### `forgeSpeedRuns`

```typescript
{
  timestamp: string,          // ISO date
  topicId: string | "mixed",  // Topic filter used
  cardTypeFilter: string[],   // ["easy"] | ["intermediate"] | ["scenario"] | ["easy","intermediate","scenario"]
  startingTime: number,       // 45 | 60 | 90
  totalCards: number,
  correctCards: number,
  partialCards: number,
  wrongCards: number,
  totalPoints: number,
  bestStreak: number,
  avgResponseMs: number,
  cardResults: {
    cardId: string,
    result: "correct" | "partial" | "wrong",
    userInput: string,        // What the player typed (for review)
    responseMs: number,
    feedback: string,         // What the evaluator reported
  }[],
}
```

Add queries:
- `getSpeedRunHistory(topicId?, cardTypeFilter?, limit)` — for the high scores table. High scores are scoped to the same filter combo (Linux + Easy has its own leaderboard vs. Linux + All).
- `getSpeedRunBestScore(topicId?, cardTypeFilter?)` — for dashboard display

---

## Badge Integration

| Badge | Condition | Icon concept |
|---|---|---|
| Speed Demon | Complete a 60s Speed Run with 90%+ accuracy | Lightning bolt |
| Untouchable | 15+ streak in a single Speed Run | Shield |
| Terminal Velocity | Answer 25+ cards in a single 60s run | Rocket |

These integrate with the existing badge shelf in `forgeProfile.badges`.

Note: "Speed Demon" already exists in the build plan with a different condition (60-min session in under 45 min). Either rename that badge to something like "Efficiency Expert" or rename this one to "Blitz Master" — CC's call on naming, just don't collide the IDs.

---

## File Structure (new / modified)

```
components/
  forge/
    speed-run/
      speed-run-game.tsx        # Main game controller (timer, state, card cycling)
      speed-run-input.tsx       # Terminal-style text input with submit
      speed-run-feedback.tsx    # Correct/partial/wrong flash + feedback text
      speed-run-hud.tsx         # Timer + combo + points heads-up display
      speed-run-results.tsx     # Game over screen + high scores + miss review
      self-grade-prompt.tsx     # Fallback: show answer + Yes/Mostly/No buttons

lib/
  forge/
    evaluator.ts               # Answer evaluation engine
      ├── evaluateCommand()     # Command parsing + comparison
      ├── evaluateKeywords()    # Keyword extraction + matching
      └── parseCommand()        # Tokenizer: string → { cmd, flags[], args[] }

convex/
  forgeSpeedRuns.ts             # Schema + queries + mutations

app/
  forge/
    speed-run/
      page.tsx                  # Setup screen (topic, card type, timer) + game mount
```

The setup page offers:

- **Topic selector**: dropdown of unlocked topics + "Mixed" option
- **Card type filter**: multi-select toggle buttons — `Easy` | `Intermediate` | `Scenario` | `All`. Default: `All`. Player can select one or multiple types. Examples:
  - "Easy" only → pure command recall, Tier 1 cards. Best for building typing muscle memory.
  - "Easy + Intermediate" → commands + troubleshooting. Good mid-week drill.
  - "Scenario" only → walk-through situations under time pressure. Hardest mode.
  - "All" → mixed bag from all unlocked card types.
  - If the selected combination returns fewer than 10 eligible cards, show a warning: "Only X cards match these filters. Broaden your selection or choose a different topic."
- **Timer**: 45s / 60s / 90s radio buttons
- **Start** button

The card type filter applies **on top of** the existing tier-lock system. If a player hasn't unlocked Tier 3 in a topic, selecting "Scenario" for that topic returns zero cards (and the warning fires). "Mixed" topic mode unions cards across all topics, still filtered by card type and tier locks.

---

## Input UX Details

The text input should feel like a terminal:

- Monospace font (JetBrains Mono, matching the app's code font)
- Dark background (`--forge-surface`), light text
- Blinking cursor
- `Enter` key submits (no need to click the button)
- `Tab` key does nothing (prevent accidental focus loss)
- Auto-focus on input after each card transition
- No autocomplete, no spellcheck (`autocomplete="off" spellCheck={false}`)

For non-command cards (definitions, concepts): the input expands to a 2-3 line textarea. Still monospace. Still `Enter` to submit (Shift+Enter for newline if needed).

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Player submits empty input | Treat as wrong. No penalty beyond the -3s. |
| Timer hits 0 mid-typing | Game ends immediately. Current card is not scored. |
| Card has no evaluable answer (e.g., pure prose scenario) | Use self-grade fallback. |
| Player types a valid alternative command that achieves the same result | Evaluator won't catch all valid alternatives. Self-grade fallback if auto-eval says "wrong" but player knows they're right — add a "I'm right, actually" override button that scores as correct but flags the card for review. |
| All 50 cards completed before timer expires | Game ends early with a completion bonus. Show remaining time as a flex stat. |

---

## Build Priority

1. Game controller + timer + card cycling (speed-run-game.tsx)
2. Terminal input component (speed-run-input.tsx)
3. Command evaluator (evaluator.ts — `parseCommand` + `evaluateCommand`)
4. Keyword evaluator (evaluator.ts — `evaluateKeywords`)
5. Feedback flash animations (speed-run-feedback.tsx)
6. SM-2 integration (wire results to existing `reviewCard` mutation)
7. Results screen + high scores (speed-run-results.tsx)
8. Convex schema + queries (forgeSpeedRuns.ts)
9. Badge integration
10. Setup page with topic/timer selection

Estimated build time: 3-4 hours for a senior CC session.

---

## Design Notes

- Match the existing Forge visual language: `--forge-bg`, `--forge-accent` (blue), `--forge-success`/`--forge-danger` for feedback
- Timer should pulse red when below 10 seconds
- Combo counter should scale up visually as multiplier increases (subtle size bump at each tier)
- Card transitions: 150ms slide (consistent with app-wide transition speed)
- No sound effects (keep it professional, and browser audio is unreliable)
- Mobile: input should trigger the keyboard immediately on card display. Timer and HUD stack vertically above the card.
