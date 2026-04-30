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

## Deployment

L1NX has **one source of truth** (`main` branch) and **two functional deployment targets**, differentiated only by build-time env vars. There is no `demo` branch — the same code feeds both. Any improvement merged to `main` reaches both targets the next time each is built.

| Target                                                | Purpose          | Build mode    | Env vars during build                                                                | How it deploys                                                                              |
|-------------------------------------------------------|------------------|---------------|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| **Vercel** (production)                               | Real app for use | Next.js SSR   | _(none)_                                                                             | Auto on every push to `main`                                                                |
| **jakebuildsfunthings.com/l1nx-forge** (static demo)  | Showcase build   | Static export | `L1NX_STATIC_EXPORT=1`<br>`NEXT_PUBLIC_L1NX_DEMO_MODE=1`<br>`L1NX_BASE_PATH=/l1nx-forge` | `npm run deploy:demo` — builds, copies into the personal-site repo, runs `wrangler deploy`  |

### How the split works

Three pieces of code branch on env vars at build time, so the same source produces both targets:

- **[next.config.js](next.config.js)** — When `L1NX_STATIC_EXPORT=1`, switches to `output: "export"` with `distDir: ".next-export"`, `trailingSlash: true`, unoptimized images, and `basePath: process.env.L1NX_BASE_PATH || ""`. Otherwise keeps the SSR config + redirects (Vercel default).
- **[lib/data/provider.tsx](lib/data/provider.tsx)** — When `NEXT_PUBLIC_L1NX_DEMO_MODE=1`, also runs `seedDemoIfEmpty()` so the demo opens onto a "lived-in" account (mastery, streak, review history, sample stories) instead of a blank dashboard.
- **[lib/data/demo-seed.ts](lib/data/demo-seed.ts)** — The demo-only seeder. Idempotent; only fills empty tables after the normal seed runs.

The `[missionId]` and `[topicId]` routes are also split into thin server components (with `generateStaticParams()`) plus client components, so static export can prerender every mission/topic at build time. This is unconditional, but it's a quiet win for Vercel too — those pages now SSG instead of fully client-rendering.

### How the static demo is hosted

The static demo lives at the path `/l1nx-forge` on the personal site **jakebuildsfunthings.com**, which is a Cloudflare Workers static-asset deployment from a separate repo at [github.com/jakeinspiredcode/jakebuildsfunthings](https://github.com/jakeinspiredcode/jakebuildsfunthings).

```
~/Projects/jakebuildsfunthings/        # the personal site repo (Cloudflare Workers)
├── index.html                         # site home
├── wrangler.jsonc                     # `wrangler deploy` ships the whole dir
└── l1nx-forge/                        # ← THIS is generated by `npm run deploy:demo`
    ├── _next/                         #   from the L1NX repo. Don't hand-edit.
    ├── missions/, study/, …           #   Tracked in git so the demo state is
    └── index.html                     #   reproducible from a clean checkout.
```

Because `l1nx-forge/` is served from a subdirectory, the build needs `L1NX_BASE_PATH=/l1nx-forge` so all routes and asset URLs are prefixed correctly. The deploy script handles this automatically.

### One-shot deploy: `npm run deploy:demo`

The script at [scripts/deploy-demo.sh](scripts/deploy-demo.sh) does the whole thing:

1. Builds the static export with all three env vars set.
2. Replaces `~/Projects/jakebuildsfunthings/l1nx-forge/` with the fresh `.next-export/`.
3. Runs `npx wrangler deploy` from the personal-site repo.

```bash
git pull                  # make sure you have the latest main
npm install               # if package.json changed
npm run deploy:demo
```

**One-time prereqs:**
- The jakebuildsfunthings repo is checked out at `~/Projects/jakebuildsfunthings`. Override with `JAKE_SITE_PATH=/elsewhere npm run deploy:demo` if it lives somewhere else.
- You've run `npx wrangler login` once on this machine and selected the Cloudflare account that owns the `jakebuildsfunthings` worker.

After the deploy, the regenerated files in `~/Projects/jakebuildsfunthings/l1nx-forge/` will be **uncommitted in that repo**. Cloudflare is already serving the new build, but if you want the rendered demo state mirrored to GitHub, commit it there:

```bash
cd ~/Projects/jakebuildsfunthings
git add l1nx-forge
git commit -m "Update l1nx-forge demo"
git push
```

### When you ship a fix or feature

1. Commit and push to `main`. Vercel auto-deploys.
2. To update the demo too: `npm run deploy:demo`.

That's it. No branch maintenance, no cherry-picking. The build output `.next-export/` is gitignored on the L1NX side and regenerated each run.

## License

MIT
