#!/usr/bin/env bash
# Build the L1NX static demo and deploy it to jakebuildsfunthings.com/l1nx-forge.
#
# Flow:
#   1. Run `next build` with static-export + demo-mode + basePath env vars set.
#      Output lands in .next-export/.
#   2. Replace ~/Projects/jakebuildsfunthings/l1nx-forge/ with the fresh build.
#   3. Run `npx wrangler deploy` from the personal-site repo (Cloudflare
#      Workers, name "jakebuildsfunthings", custom domain jakebuildsfunthings.com).
#
# Prereqs (one-time):
#   - The jakebuildsfunthings repo is checked out at ~/Projects/jakebuildsfunthings
#     (override with JAKE_SITE_PATH=/elsewhere).
#   - You have run `npx wrangler login` once on this machine and the
#     Cloudflare account that owns the worker is selected.
#
# Usage:
#   npm run deploy:demo
#
# After this finishes, the rendered files in jakebuildsfunthings/l1nx-forge
# will be uncommitted in that repo. Commit them there if you want the demo
# state mirrored to GitHub — Cloudflare itself is already updated.

set -euo pipefail

SITE_PATH="${JAKE_SITE_PATH:-$HOME/Projects/jakebuildsfunthings}"
DEMO_DIR="$SITE_PATH/l1nx-forge"
EXPORT_DIR=".next-export"

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
