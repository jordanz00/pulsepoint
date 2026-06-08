#!/usr/bin/env bash
# Start Next.js on port 3000 — clears stale hung servers first.
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}"

respond_ok() {
  curl -sf --max-time 5 -o /dev/null "$1" 2>/dev/null
}

if lsof -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  if respond_ok "${BASE}/api/health" || respond_ok "${BASE}/"; then
    echo "Port ${PORT} already serving PulsePoint — reusing existing server."
    echo "Open: ${BASE}/"
    exit 0
  fi
  echo "⚠ Port ${PORT} is occupied but not responding — stopping stale process…"
  lsof -tiTCP:"${PORT}" -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
  sleep 1
fi

if [[ ! -f .env.local ]]; then
  echo "❌ Missing .env.local — copy .env.local.example and set DEMO_MODE=true"
  exit 1
fi

if ! grep -q '^DEMO_MODE=true' .env.local 2>/dev/null; then
  echo "⚠ Tip: DEMO_MODE=true in .env.local avoids Clerk and blank auth states locally."
fi

if [[ ! -f prisma/demo.db ]]; then
  echo "⚠ No prisma/demo.db — run: pnpm demo:setup"
elif command -v sqlite3 >/dev/null 2>&1; then
  if ! sqlite3 prisma/demo.db "SELECT 1 FROM sqlite_master WHERE type='table' AND name='AdvocacyCampaignResponse';" 2>/dev/null | grep -q 1; then
    echo "⚠ Demo DB schema out of date (missing AdvocacyCampaignResponse) — running prisma db push …"
    pnpm db:push
    echo "✓ Schema synced. If pages still fail, run: pnpm demo:setup"
  fi
fi

echo "Starting Next.js on ${BASE} …"
exec pnpm exec next dev --port "${PORT}"
