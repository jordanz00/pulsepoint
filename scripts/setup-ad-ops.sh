#!/usr/bin/env bash
# PulsePoint — ad-ops Postgres + Redis + Prisma seed
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== PulsePoint ad-ops setup =="

if ! docker compose ps ams_db 2>/dev/null | grep -q running; then
  echo "Starting ams_db + redis via docker compose…"
  docker compose up -d ams_db redis
  echo "Waiting for Postgres…"
  sleep 4
fi

if [[ ! -f packages/api/.env ]]; then
  cp packages/api/.env.example packages/api/.env
  echo "Created packages/api/.env from example."
fi
if [[ ! -f packages/worker/.env ]]; then
  cp packages/worker/.env.example packages/worker/.env
  echo "Created packages/worker/.env from example."
fi

echo "Building @ams/shared…"
pnpm ad-ops:build-shared

echo "Pushing ad-ops schema + seed…"
pnpm --filter @ams/api exec prisma generate
pnpm --filter @ams/worker exec prisma generate
pnpm --filter @ams/api exec prisma db push
pnpm --filter @ams/api run db:seed

echo ""
echo "Done. Run: pnpm dev"
echo "Ad ops UI: http://localhost:3000/demo-healthcare/advertising (after demo:setup + Enter demo)"
