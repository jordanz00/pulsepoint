#!/usr/bin/env bash
# EARN-WORTH — full ship gate (no partial "done")
set -euo pipefail
cd "$(dirname "$0")/.."

echo "╔══════════════════════════════════════╗"
echo "║  PulsePoint SHIP-NOW gate bundle     ║"
echo "╚══════════════════════════════════════╝"

echo "→ claims:validate"
pnpm claims:validate

echo "→ leak:checks"
pnpm leak:checks

echo "→ vitest (unit)"
pnpm test

echo "→ typecheck"
pnpm exec tsc --noEmit

echo "→ status board"
python3 scripts/generate-status-board.py

WAVE_DATE="$(date +%Y-%m-%d)"
WAVE_STUB="data/quake-os/waves/${WAVE_DATE}-ship-now-autolog.md"
if [[ ! -f "$WAVE_STUB" ]]; then
  cat > "$WAVE_STUB" <<EOF
# Ship-now autolog

**Date:** ${WAVE_DATE}
**Gates:** all passed via \`pnpm ship:now\`

VERDICT: APPROVED (automated gate run)
EOF
fi

echo ""
echo "✔ SHIP-NOW: ALL GATES PASSED"
echo "  Next: browser-verify UI if marketing/admin changed"
echo "  Wave stub: $WAVE_STUB"
