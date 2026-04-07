# L1NX

A spaced-repetition training app built with **Next.js**, **Convex**, and **Tailwind CSS**. L1NX prepares users for data center technician roles through tiered flashcards, interactive exercises, mock interviews, and progress tracking.

## Features

- **SM-2 Spaced Repetition** — Cards are scheduled using the SuperMemo 2 algorithm, surfacing weak material at optimal intervals.
- **Tiered Difficulty (1–4)** — Cards progress from basic recall through intermediate concepts to multi-step scenarios. Higher tiers unlock as earlier tiers are mastered.
- **Topic-Based Organization** — Content is grouped into study topics, each with its own mastery percentage, tier progress, and weak-flag detection.
- **Daily Training Plans** — An intelligent scheduler builds a daily session mixing due reviews, weak-area drills, and new cards.
- **Mock Interviews** — Timed sessions with rubric scoring (technical accuracy, structure, ownership) and missed-term tracking.
- **Readiness Radar** — A radar chart showing mastery across all topics at a glance.
- **Streaks, Points & Badges** — Gamification to keep study habits consistent.
- **STAR Story Bank** — A dedicated section for building and refining behavioral interview stories.

## Tech Stack

| Layer       | Technology                       |
|-------------|----------------------------------|
| Framework   | Next.js 15 (App Router)          |
| Backend/DB  | Convex (real-time, serverless)   |
| Styling     | Tailwind CSS 4                   |
| Charts      | Recharts                         |
| Language    | TypeScript                       |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account (free tier works)

### Install & Run

```bash
# Install dependencies
npm install

# Start Convex dev server (first time will prompt you to set up a project)
npx convex dev

# In a separate terminal, start the Next.js dev server
npm run dev
```

The app seeds the database automatically on first load.

### Environment Variables

Create a `.env.local` file:

```
CONVEX_DEPLOYMENT=<your-convex-deployment>
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
```

## Project Structure

```
app/                  # Next.js App Router pages
  page.tsx            # Dashboard — daily plan, radar, topic grid
  study/              # Topic drill pages
  interview/          # Mock interview session
  progress/           # Progress analytics
  stories/            # STAR story bank
components/           # React components
  card-queue.tsx      # Flashcard review session UI
  flashcard.tsx       # Individual card with flip + self-grading
  readiness-radar.tsx # Radar chart visualization
  daily-plan.tsx      # Scheduled training session display
  ...
convex/               # Convex backend (schema, mutations, queries)
lib/
  types.ts            # Core TypeScript types
  sm2.ts              # SM-2 algorithm implementation
  forge/scheduler.ts  # Daily plan generation logic
  seeds/              # Seed data for flashcard content
```

## How It Works

1. **Seed** — On first load, the app populates the Convex database with flashcard content organized by topic and tier.
2. **Study** — The scheduler builds a daily plan. Cards are reviewed with a 0–5 quality self-grade that feeds the SM-2 algorithm.
3. **Progress** — Each review updates the card's ease factor, interval, and next due date. Topic-level mastery is recomputed after each session.
4. **Unlock** — When 80%+ of a tier's cards reach "qualified" status (interval >= 7 days), the next tier unlocks.
5. **Interview** — Mock interview mode presents scenario cards under timed conditions with structured rubric feedback.

## License

MIT
