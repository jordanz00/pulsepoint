#!/usr/bin/env bash
# Prepare Prisma SQLite for CI and gate scripts (schema provider = sqlite).
set -euo pipefail
cd "$(dirname "$0")/.."

export DATABASE_URL="${DATABASE_URL:-file:./prisma/ci.db}"

if [[ "${DATABASE_URL}" != file:* ]]; then
  echo "ci-db-prepare: skipping (non-SQLite DATABASE_URL)"
  exit 0
fi

echo "ci-db-prepare: SQLite at ${DATABASE_URL}"
pnpm db:generate
# Migrations on disk are legacy Postgres SQL; push current schema for SQLite CI.
pnpm exec prisma db push --skip-generate
