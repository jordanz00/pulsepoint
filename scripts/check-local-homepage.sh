#!/usr/bin/env bash
# Verify local dev server responds (catches hung port 3000).
set -euo pipefail

PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}"

fail() {
  echo "❌ $1"
  echo "   Fix: cd /Users/jordanzabady/Desktop/pulse && pnpm dev"
  exit 1
}

if ! lsof -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  fail "Nothing listening on port ${PORT}. Run: pnpm dev"
fi

if ! curl -sf --max-time 8 "${BASE}/api/health" | grep -q '"ok":true'; then
  fail "Health check timed out on ${BASE}/api/health (server may be hung)."
fi

BYTES=$(curl -sf --max-time 15 -o /tmp/pulse-home-check.html -w "%{size_download}" "${BASE}/" || echo "0")
if [[ "${BYTES}" -lt 1000 ]]; then
  fail "Homepage returned too little HTML (${BYTES} bytes). Server may be stuck."
fi

if ! grep -qi "PulsePoint" /tmp/pulse-home-check.html; then
  fail "Homepage HTML missing PulsePoint branding."
fi

echo "✅ Local homepage OK (${BYTES} bytes) — ${BASE}/"
