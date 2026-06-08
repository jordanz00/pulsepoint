#!/usr/bin/env bash
# Start $0 warm standby via Docker (laptop / home server).
set -euo pipefail
cd "$(dirname "$0")/../.."

if [[ ! -f .env.standby ]]; then
  echo "Creating .env.standby from example — edit DATABASE_URL before production cutover."
  cp .env.standby.example .env.standby
fi

echo "Building and starting standby on http://localhost:3000"
docker compose -f docker-compose.standby.yml up -d --build
sleep 3
./scripts/failover-preflight.sh http://localhost:3000
echo ""
echo "Standby ready. Keep this machine on for warm failover."
echo "Monitor primary: PRIMARY_URL=https://your.vercel.app pnpm continuity:health"
