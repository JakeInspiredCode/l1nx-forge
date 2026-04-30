#!/usr/bin/env bash
# Build the L1NX static demo and deploy it to jakebuildsfunthings.com/l1nx-forge.
#
# Flow:
#   1. Pre-flight: confirm wrangler is authenticated against Cloudflare
#      (skipped with --build-only).
#   2. Run `next build` with static-export + demo-mode + basePath env vars set.
#      Output lands in .next-export/.
#   3. Replace ~/Projects/jakebuildsfunthings/l1nx-forge/ with the fresh build.
#   4. Run `npx wrangler deploy` from the personal-site repo (Cloudflare
#      Workers, name "jakebuildsfunthings", custom domain jakebuildsfunthings.com).
#
# Prereqs (one-time):
#   - The jakebuildsfunthings repo is checked out at ~/Projects/jakebuildsfunthings
#     (override with JAKE_SITE_PATH=/elsewhere).
#   - You have run `npx wrangler login` once on this machine in an interactive
#     terminal, and the Cloudflare account that owns the worker is selected.
#
# Usage:
#   npm run deploy:demo                    # full build + deploy
#   npm run deploy:demo -- --build-only    # build + copy, skip wrangler deploy
#                                          # (use this from non-interactive shells
#                                          # like LLM agents that can't open a
#                                          # browser for OAuth)
#
# After a full deploy, the rendered files in jakebuildsfunthings/l1nx-forge
# will be uncommitted in that repo. Commit them there if you want the demo
# state mirrored to GitHub — Cloudflare itself is already updated.

set -euo pipefail

SITE_PATH="${JAKE_SITE_PATH:-$HOME/Projects/jakebuildsfunthings}"
DEMO_DIR="$SITE_PATH/l1nx-forge"
EXPORT_DIR=".next-export"

BUILD_ONLY=0
case "${1:-}" in
  --build-only|--skip-deploy) BUILD_ONLY=1 ;;
  "") ;;
  *)
    echo "Unknown argument: $1" >&2
    echo "Usage: $0 [--build-only]" >&2
    exit 2
    ;;
esac

if [ ! -d "$SITE_PATH" ]; then
  echo "Error: personal-site repo not found at $SITE_PATH" >&2
  echo "Set JAKE_SITE_PATH=/path/to/jakebuildsfunthings to override." >&2
  exit 1
fi

if [ ! -f "$SITE_PATH/wrangler.jsonc" ] && [ ! -f "$SITE_PATH/wrangler.toml" ]; then
  echo "Error: $SITE_PATH does not look like the wrangler-managed personal site" >&2
  echo "(no wrangler.jsonc or wrangler.toml found)." >&2
  exit 1
fi

# Pre-flight wrangler auth check — fail fast before the (slow) build if we
# already know the deploy will fail.
if [ "$BUILD_ONLY" = "0" ]; then
  echo "→ Checking Cloudflare authentication…"
  if ! ( cd "$SITE_PATH" && npx --yes wrangler whoami >/dev/null 2>&1 ); then
    cat <<'EOF' >&2
Error: wrangler is not authenticated against the Cloudflare account that
owns the jakebuildsfunthings worker.

From an interactive terminal, run:
  cd ~/Projects/jakebuildsfunthings
  npx wrangler login

Then retry: npm run deploy:demo

If you're an LLM agent (or any non-interactive shell) and can't open a
browser, run the build/copy half on its own and hand the deploy step
back to the human:
  npm run deploy:demo -- --build-only
EOF
    exit 1
  fi
fi

echo "→ Building static export (basePath=/l1nx-forge, demo seed on)…"
L1NX_STATIC_EXPORT=1 \
NEXT_PUBLIC_L1NX_DEMO_MODE=1 \
L1NX_BASE_PATH=/l1nx-forge \
  npm run build

if [ ! -d "$EXPORT_DIR" ]; then
  echo "Error: build did not produce $EXPORT_DIR — aborting before touching $DEMO_DIR." >&2
  exit 1
fi

echo "→ Replacing $DEMO_DIR with the fresh build…"
rm -rf "$DEMO_DIR"
cp -R "$EXPORT_DIR" "$DEMO_DIR"

if [ "$BUILD_ONLY" = "1" ]; then
  cat <<EOF

✔ Build copied to $DEMO_DIR. Wrangler deploy SKIPPED (--build-only).

To finish the deploy, run from your interactive terminal:
  cd $SITE_PATH
  npx wrangler deploy

EOF
  exit 0
fi

echo "→ Deploying personal site to Cloudflare via wrangler…"
( cd "$SITE_PATH" && npx --yes wrangler deploy )

cat <<EOF

✔ Demo deployed: https://jakebuildsfunthings.com/l1nx-forge/

Cloudflare is now serving the new build. The change in $SITE_PATH is
uncommitted; commit it there if you want the demo state mirrored to GitHub:

  cd $SITE_PATH
  git add l1nx-forge
  git commit -m "Update l1nx-forge demo"
  git push

EOF
