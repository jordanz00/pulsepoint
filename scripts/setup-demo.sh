#!/usr/bin/env bash
# PulsePoint — local demo DB (SQLite file, no Docker)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== PulsePoint demo setup (SQLite, no Docker) =="

if ! grep -q 'file:./prisma/demo.db' .env.local 2>/dev/null; then
  echo "Tip: set DATABASE_URL=file:./prisma/demo.db in .env.local"
fi

echo "Creating schema in prisma/demo.db ..."
pnpm db:push

echo "Seeding Sterling Healthcare demo data ..."
pnpm db:seed:demo

echo ""
echo "Done. Run: pnpm dev"
echo "Open:  http://localhost:3000/demo"
echo "Admin: http://localhost:3000/demo-healthcare (after Enter demo)"
