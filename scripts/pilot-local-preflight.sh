#!/usr/bin/env bash
# Local pilot preflight — everything engineering can verify without staging.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== PulsePoint local pilot preflight =="
pnpm demo:doctor
pnpm claims:validate
pnpm leak:checks
pnpm exec vitest run tests/unit/platform-glance.test.ts tests/unit/bl-026-027-closure.test.ts
pnpm exec tsc --noEmit
echo "OK — local gates passed. Human gates: docs/SPRINT-A-OPERATOR-PACKET.md"
