#!/usr/bin/env bash
# PulsePoint — verify standby host is ready before DNS cutover
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

echo "== Failover preflight: ${BASE_URL} =="

code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/health" || echo "000")
if [[ "$code" != "200" ]]; then
  echo "FAIL: /api/health returned ${code}"
  exit 1
fi
echo "OK: /api/health"

code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/demo" || echo "000")
if [[ "$code" != "200" ]]; then
  echo "WARN: /demo returned ${code} (may be OK if Clerk-only production)"
else
  echo "OK: /demo"
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "OK: DATABASE_URL is set"
else
  echo "WARN: DATABASE_URL unset in shell (may still be set in container env)"
fi

echo ""
echo "Preflight passed. Safe to point DNS or announce backup URL."
echo "See docs/BUSINESS-CONTINUITY.md"
