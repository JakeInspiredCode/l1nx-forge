# Notes for Claude (LLM agents)

This file is loaded automatically into your context. The README is the canonical user-facing doc — read it when relevant. This file only covers things that aren't obvious from reading the code.

## Two deployment targets, one branch

- **`main` is the only branch that matters.** No `demo` / `staging` branches.
- **Vercel** auto-deploys `main` for the production app. No env vars set there.
- **jakebuildsfunthings.com/l1nx-forge** is a static export of the same `main`, built with three env vars (`L1NX_STATIC_EXPORT=1`, `NEXT_PUBLIC_L1NX_DEMO_MODE=1`, `L1NX_BASE_PATH=/l1nx-forge`). Hosted on Cloudflare Workers from a separate repo at `~/Projects/jakebuildsfunthings`.
- **Both targets stay in sync** because env-gated branches in `next.config.js` and `lib/data/provider.tsx` produce the right output for each. See [README.md](README.md#deployment) for the full picture.

## Deploying the static demo

Use [`scripts/deploy-demo.sh`](scripts/deploy-demo.sh), wired up as `npm run deploy:demo`. The script:

1. Builds with the three env vars set.
2. Replaces `~/Projects/jakebuildsfunthings/l1nx-forge/` with the fresh `.next-export/`.
3. Commits + pushes the personal-site repo's `l1nx-forge/`.
4. Cloudflare Workers Build auto-deploys from `origin/main` ~60s later.

**Critical: GitHub is the source of truth, not local files.** Cloudflare Workers Build is wired to the personal-site repo and redeploys from `origin/main` on every push. So a local-only `wrangler deploy` is overwritten by the next push to that repo. The script always commits + pushes; never skip that step.

**You can run this end-to-end from a non-interactive shell.** No Cloudflare OAuth needed — the script doesn't call `wrangler deploy` directly, just `git push`, which uses the same credentials any normal push would.

To watch the deploy land after pushing:

```bash
NEW_HASH=$(grep -oE '_next/static/css/[a-z0-9]+\.css' ~/Projects/jakebuildsfunthings/l1nx-forge/index.html | head -1 | sed 's|.*/||;s|\.css$||')
until curl -s https://jakebuildsfunthings.com/l1nx-forge/ | grep -q "$NEW_HASH"; do sleep 5; done; echo "Live."
```

Vercel deploys are easier: just `git push origin main` from this repo and Vercel handles the rest.

## Things that look weird but are intentional

- **Lesson content uses inline pixel font sizes.** `components/linux-foundations.tsx` and `components/chapter/*` set sizes in absolute px (e.g., `fontSize: 11`) instead of Tailwind utilities. This is on purpose — there's a per-lesson "Aa" size toggle ([`lib/use-lesson-scale.ts`](lib/use-lesson-scale.ts)) that scales the whole lesson via CSS transform. **Don't bump these to "fix" them** unless the user asks for lesson-content typography changes specifically.
- **The route refactor for `[missionId]` and `[topicId]`** (server component + `generateStaticParams`, with a client component sibling) exists so the static export can prerender every page. It's load-bearing for the demo build — don't collapse it back to a single client component.
- **`.next-export/` is gitignored on the L1NX side** but tracked in the personal-site repo (where it lives at `l1nx-forge/`). Cloudflare needs concrete files; Vercel doesn't.

## Don't hand-edit `~/Projects/jakebuildsfunthings/l1nx-forge/`

It's regenerated from this repo every time `npm run deploy:demo` runs. Any changes you make there will be wiped. To change demo behavior, change the source in this repo and redeploy.

## When you've shipped a fix that should reach the demo too

```bash
# 1. Push to main → Vercel auto-deploys
git push origin main

# 2. Update the static demo (works from any shell, no OAuth)
npm run deploy:demo
```
