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
pnpm exec prisma db push

# Reduce SQLITE_BUSY / Prisma P1008 under Vitest (WAL + wait instead of fail-fast).
DB_FILE="${DATABASE_URL#file:}"
if [[ "${DB_FILE}" == ./* ]]; then
  DB_FILE="$(pwd)/${DB_FILE#./}"
fi
if command -v sqlite3 >/dev/null 2>&1 && [[ -f "${DB_FILE}" ]]; then
  sqlite3 "${DB_FILE}" "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=30000; PRAGMA synchronous=NORMAL;"
  echo "ci-db-prepare: WAL + busy_timeout=30000 on ${DB_FILE}"
else
  echo "ci-db-prepare: skip PRAGMA (sqlite3 missing or db not found: ${DB_FILE})"
fi
