#!/usr/bin/env bash
# PulsePoint — local demo DB (SQLite file, no Docker)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== PulsePoint demo setup (SQLite, no Docker) =="

if ! grep -q 'file:./prisma/demo.db' .env.local 2>/dev/null; then
  echo "Tip: set DATABASE_URL=file:./prisma/demo.db in .env.local"
fi

echo "Syncing schema in prisma/demo.db (applies new tables e.g. AdvocacyCampaignResponse) ..."
pnpm db:push

echo "Seeding Sterling Healthcare demo data ..."
pnpm db:seed:demo

if command -v sqlite3 >/dev/null 2>&1; then
  if ! sqlite3 prisma/demo.db "SELECT 1 FROM sqlite_master WHERE type='table' AND name='AdvocacyCampaignResponse';" | grep -q 1; then
    echo "❌ Schema sync failed — AdvocacyCampaignResponse table missing. Re-run: pnpm demo:setup"
    exit 1
  fi
fi

if ! grep -q '^PAYMENT_ADAPTER=' .env.local 2>/dev/null; then
  echo "PAYMENT_ADAPTER=manual" >> .env.local
  echo "Added PAYMENT_ADAPTER=manual to .env.local (demo checkout without Stripe keys)."
fi

echo ""
echo "Done. Run: pnpm dev"
echo "Open:  http://localhost:3000/demo"
echo "Admin: http://localhost:3000/demo-healthcare (after Enter demo)"
