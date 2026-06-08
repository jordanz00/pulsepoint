#!/usr/bin/env bash
# PulsePoint demo doctor — verify local demo.db schema + seed org
set -euo pipefail
cd "$(dirname "$0")/.."

FAIL=0
check() {
  if "$@"; then
    echo "  OK: $*"
  else
    echo "  FAIL: $*"
    FAIL=1
  fi
}

echo "== PulsePoint demo doctor =="

if [[ ! -f prisma/demo.db ]]; then
  echo "❌ prisma/demo.db missing — run: pnpm demo:setup"
  exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "⚠ sqlite3 not installed — skipping table checks"
else
  for table in Organization Member AdvocacyCampaignResponse MemberOrganization; do
    if sqlite3 prisma/demo.db "SELECT 1 FROM sqlite_master WHERE type='table' AND name='${table}';" | grep -q 1; then
      echo "  OK: table ${table}"
    else
      echo "  FAIL: missing table ${table} — run: pnpm db:push && pnpm db:seed:demo"
      FAIL=1
    fi
  done

  ORG_COUNT=$(sqlite3 prisma/demo.db "SELECT COUNT(*) FROM Organization WHERE slug='demo-healthcare';" 2>/dev/null || echo 0)
  if [[ "${ORG_COUNT}" -ge 1 ]]; then
    echo "  OK: demo-healthcare org seeded"
  else
    echo "  FAIL: demo-healthcare org missing — run: pnpm db:seed:demo"
    FAIL=1
  fi
fi

check grep -q '^DEMO_MODE=true' .env.local 2>/dev/null || true
if ! grep -q '^DEMO_MODE=true' .env.local 2>/dev/null; then
  echo "  WARN: DEMO_MODE=true not set in .env.local"
fi

if [[ "${FAIL}" -eq 0 ]]; then
  echo ""
  echo "Demo doctor: OK"
  exit 0
fi

echo ""
echo "Demo doctor: NEEDS_FIX — run: pnpm demo:setup"
exit 1
