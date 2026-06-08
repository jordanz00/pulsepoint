#!/usr/bin/env bash
# Quake OS — automated quality gates (run each wave or on CI schedule)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== Quake OS gates =="
pnpm claims:validate
pnpm leak:checks
pnpm test
echo "== Quake OS bootstrap =="
pnpm quake:os
pnpm typecheck
python3 scripts/generate-status-board.py
echo "Quake OS gates: OK"
