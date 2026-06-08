#!/usr/bin/env bash
# Quake OS — full execution workflow (research → gates → ship proof)
# Usage: pnpm quake:execute [wave-name]
set -euo pipefail
cd "$(dirname "$0")/.."

WAVE="${1:-$(date +%Y-%m-%d)-execute}"
WAVE_FILE="data/quake-os/waves/${WAVE}-wave.md"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  QUAKE EXECUTE — full workflow                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo "Wave id: ${WAVE}"
echo ""

echo "▸ Phase 1 — Environment & demo integrity"
pnpm demo:doctor

echo ""
echo "▸ Phase 2 — Type safety"
pnpm exec tsc --noEmit

echo ""
echo "▸ Phase 3 — Unit + integration tests"
pnpm test

echo ""
echo "▸ Phase 4 — Marketing claims & tenant isolation"
pnpm claims:validate
pnpm leak:checks

echo ""
echo "▸ Phase 5 — E2E (demo wedge + advocacy)"
pnpm test:e2e

echo ""
echo "▸ Phase 6 — Quake OS gates + status board"
pnpm quake:gates

echo ""
echo "▸ Phase 7 — Backlog snapshot"
node -e "
const b=require('./data/quake-os/improvement-backlog.json');
const open=b.items.filter(i=>i.status!=='done').length;
const done=b.items.filter(i=>i.status==='done').length;
console.log('Backlog: '+done+' done, '+open+' open (excl. auto-memory)');
"

if [[ ! -f "${WAVE_FILE}" ]]; then
  mkdir -p data/quake-os/waves
  cat > "${WAVE_FILE}" <<EOF
# Quake Execute — ${WAVE}

**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Command:** \`pnpm quake:execute ${WAVE}\`

## Gates (all passed)

- demo:doctor
- tsc --noEmit
- test
- claims:validate + leak:checks
- test:e2e
- quake:gates

## Human sign-off

- [ ] BL-003 pilot ops (if staging wave)
- [ ] Branch protection E2E check enabled
EOF
  echo "Wrote ${WAVE_FILE}"
fi

echo ""
echo "✓ QUAKE EXECUTE complete — ${WAVE}"
