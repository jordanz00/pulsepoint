#!/usr/bin/env bash
# Build a static marketing site from the real Next.js (marketing) tree for GitHub Pages.
# Uploads `out/` — same UI as localhost:3000 marketing, with basePath /pulsepoint.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STASH_DIR="$(mktemp -d "${TMPDIR:-/tmp}/pulse-gh-pages.XXXXXX")"
cleanup() {
  # Restore anything we moved aside
  if [[ -d "$STASH_DIR/middleware" ]]; then
    mv "$STASH_DIR/middleware/middleware.ts" "$ROOT/middleware.ts" 2>/dev/null || true
  fi
  if [[ -d "$STASH_DIR/app" ]]; then
    shopt -s nullglob
    for item in "$STASH_DIR/app"/* "$STASH_DIR/app"/.[!.]*; do
      [[ -e "$item" ]] || continue
      base="$(basename "$item")"
      # Remove stub we may have written over a real path
      rm -rf "$ROOT/app/$base"
      mv "$item" "$ROOT/app/$base"
    done
    shopt -u nullglob
  fi
  rm -rf "$STASH_DIR"
}
trap cleanup EXIT

echo "▶ Preparing marketing-only tree for static export…"

mkdir -p "$STASH_DIR/middleware" "$STASH_DIR/app"

# Middleware is unsupported with output: 'export'
if [[ -f middleware.ts ]]; then
  mv middleware.ts "$STASH_DIR/middleware/middleware.ts"
fi

# Routes that need a Node server / dynamic segments — exclude from export
EXCLUDE=(
  "[orgSlug]"
  "actions"
  "api"
  "dashboard"
  "demo"
  "forms"
  "onboarding"
  "platform"
  "sign-in"
  "sign-up"
)

for name in "${EXCLUDE[@]}"; do
  if [[ -e "app/$name" ]]; then
    mv "app/$name" "$STASH_DIR/app/$name"
  fi
done

# Static demo stub (CTAs on the marketing page still point at /demo)
mkdir -p app/demo
cat > app/demo/page.tsx <<'EOF'
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooterPremium } from "@/components/marketing/marketing-footer-premium";
import { SkipToMain } from "@/components/skip-to-main";

export const metadata = {
  title: "Try the demo — PulsePoint",
  description: "Run the full PulsePoint AMS demo on your machine.",
};

export default function GitHubPagesDemoStub() {
  return (
    <div className="pp-canvas pp-marketing-canvas min-h-screen">
      <SkipToMain />
      <MarketingHeader userId={null} standalone />
      <main id="main-content" className="mk-section">
        <div className="mk-container max-w-2xl text-center">
          <p className="mk-section-eyebrow">Full AMS demo</p>
          <h1 className="mk-section-title mt-2">Run PulsePoint locally</h1>
          <p className="mk-section-lead mt-4">
            This GitHub Pages site is the same marketing experience as{" "}
            <code className="text-sm">localhost:3000</code>. The interactive AMS
            (roster, events, Stripe, demo walkthrough) needs the Next.js app on
            your machine.
          </p>
          <pre className="mt-8 overflow-x-auto rounded-xl border border-[var(--pc-border)] bg-[var(--pc-bg-elevated)] p-4 text-left text-sm text-[var(--pc-text)]">
{`git clone https://github.com/jordanz00/pulsepoint.git
cd pulsepoint
pnpm install
pnpm demo:setup
pnpm dev`}
          </pre>
          <p className="mt-4 text-sm text-[var(--pc-text-secondary)]">
            Then open <strong>http://localhost:3000/demo</strong>
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/" className="pc-btn-primary min-h-[3rem] px-8">
              Back to homepage
            </Link>
            <a
              href="https://github.com/jordanz00/pulsepoint"
              className="pc-btn-secondary min-h-[3rem]"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </main>
      <MarketingFooterPremium />
    </div>
  );
}
EOF

echo "▶ Building static export (basePath=/pulsepoint)…"
export GITHUB_PAGES=true
export NEXT_PUBLIC_GITHUB_PAGES=true
export DEMO_MODE=true
# Avoid Clerk during standalone-style marketing render
export DEMO_SESSION_SECRET="${DEMO_SESSION_SECRET:-gh-pages-static-build-secret-32chars}"
export NEXT_DIST_DIR="${NEXT_DIST_DIR:-.next-gh-pages}"

rm -rf out "$NEXT_DIST_DIR" || true

pnpm exec prisma generate
pnpm exec next build

# Next 16 + custom distDir places the static export inside distDir (not ./out).
if [[ -d out && -f out/index.html ]]; then
  :
elif [[ -f "$NEXT_DIST_DIR/index.html" ]]; then
  mkdir -p out
  # Copy published site surface only (skip Turbopack/RSC scratch files).
  shopt -s nullglob
  for item in \
    "$NEXT_DIST_DIR"/index.html \
    "$NEXT_DIST_DIR"/404.html \
    "$NEXT_DIST_DIR"/404 \
    "$NEXT_DIST_DIR"/_next \
    "$NEXT_DIST_DIR"/_not-found \
    "$NEXT_DIST_DIR"/demo \
    "$NEXT_DIST_DIR"/privacy \
    "$NEXT_DIST_DIR"/terms \
    "$NEXT_DIST_DIR"/whats-new \
    "$NEXT_DIST_DIR"/compare-protech \
    "$NEXT_DIST_DIR"/built-by-comms \
    "$NEXT_DIST_DIR"/favicon.ico \
    "$NEXT_DIST_DIR"/*.svg \
    "$NEXT_DIST_DIR"/*.png \
    "$NEXT_DIST_DIR"/*.ico \
    "$NEXT_DIST_DIR"/*.jpeg \
    "$NEXT_DIST_DIR"/*.jpg \
    "$NEXT_DIST_DIR"/*.webp \
    "$NEXT_DIST_DIR"/*.avif
  do
    [[ -e "$item" ]] || continue
    cp -R "$item" out/
  done
  shopt -u nullglob
else
  echo "❌ expected out/index.html or $NEXT_DIST_DIR/index.html from next export" >&2
  exit 1
fi

if [[ ! -f out/index.html ]]; then
  echo "❌ out/index.html missing after export packaging" >&2
  exit 1
fi

# Ensure .nojekyll for GitHub Pages
touch out/.nojekyll

echo "✅ Static site ready in out/ ($(du -sh out | cut -f1))"
echo "   Smoke: open out/index.html — should match localhost marketing (basePath /pulsepoint)."
