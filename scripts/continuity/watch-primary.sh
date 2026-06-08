#!/usr/bin/env bash
# Poll PRIMARY_URL; on failure print cutover instructions ($0 — run on your Mac).
set -euo pipefail

PRIMARY_URL="${PRIMARY_URL:?Set PRIMARY_URL=https://your-app.vercel.app}"
INTERVAL="${INTERVAL:-60}"
FAIL_THRESHOLD="${FAIL_THRESHOLD:-3}"

failures=0
echo "Watching ${PRIMARY_URL}/api/health every ${INTERVAL}s (threshold ${FAIL_THRESHOLD})"

while true; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${PRIMARY_URL}/api/health" || echo "000")
  if [[ "$code" == "200" ]]; then
    failures=0
    echo "$(date -Iseconds) OK"
  else
    failures=$((failures + 1))
    echo "$(date -Iseconds) FAIL http=${code} (${failures}/${FAIL_THRESHOLD})"
    if [[ "$failures" -ge "$FAIL_THRESHOLD" ]]; then
      echo ""
      echo "PRIMARY DOWN — run: pnpm continuity:cutover && pnpm continuity:standby"
      pnpm continuity:cutover 2>/dev/null || true
      failures=0
    fi
  fi
  sleep "$INTERVAL"
done
