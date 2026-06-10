#!/usr/bin/env bash
# Ensure http://localhost:3000 serves PulsePoint — start in background if needed.
# Use after E2E/quake:execute (Playwright stops the dev server it spawned).
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}"
LOG="${PULSE_DEV_LOG:-/tmp/pulse-dev.log}"
PIDFILE="${PULSE_DEV_PIDFILE:-/tmp/pulse-dev.pid}"

respond_ok() {
  curl -sf --max-time 5 -o /dev/null "$1" 2>/dev/null
}

health_ok() {
  respond_ok "${BASE}/api/health" && respond_ok "${BASE}/"
}

if health_ok; then
  echo "✅ Dev server OK — ${BASE}/"
  exit 0
fi

if lsof -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "⚠ Port ${PORT} occupied but not responding — clearing stale process…"
  lsof -tiTCP:"${PORT}" -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
  sleep 1
fi

if [[ ! -f .env.local ]]; then
  echo "❌ Missing .env.local — copy .env.local.example and set DEMO_MODE=true"
  exit 1
fi

if [[ ! -f prisma/demo.db ]]; then
  echo "⚠ No prisma/demo.db — running pnpm demo:setup…"
  pnpm demo:setup
elif command -v sqlite3 >/dev/null 2>&1; then
  if ! sqlite3 prisma/demo.db "SELECT 1 FROM sqlite_master WHERE type='table' AND name='AdvocacyCampaignResponse';" 2>/dev/null | grep -q 1; then
    echo "⚠ Demo DB schema out of date — running pnpm db:push…"
    pnpm db:push
  fi
fi

echo "Starting Next.js in background on ${BASE} …"
nohup pnpm exec next dev --port "${PORT}" >>"${LOG}" 2>&1 &
echo $! >"${PIDFILE}"

for _ in $(seq 1 45); do
  if health_ok; then
    echo "✅ Dev server ready — ${BASE}/ (pid $(cat "${PIDFILE}"))"
    echo "   Log: ${LOG}"
    exit 0
  fi
  sleep 1
done

echo "❌ Dev server did not become healthy within 45s"
echo "   Log tail:"
tail -25 "${LOG}" 2>/dev/null || true
exit 1
