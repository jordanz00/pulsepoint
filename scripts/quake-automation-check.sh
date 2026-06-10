#!/usr/bin/env bash
# Quake OS — verify Cursor Automation prerequisites (read-only).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ok=0
fail=0

check() {
  if [[ -e "$1" ]]; then
    echo "  ✔ $1"
    ok=$((ok + 1))
  else
    echo "  ✗ missing: $1"
    fail=$((fail + 1))
  fi
}

echo "Quake OS — Cursor Automation readiness"
echo "Repo: $ROOT"
echo ""

echo "Core agents + rules:"
check ".cursor/rules/quake-os-orchestrator.mdc"
check ".cursor/agents/quake-os-orchestrator.md"
check ".cursor/agents/quake-os-continuous-runner.md"
check ".cursor/agents/quake-os-audit.md"

echo ""
echo "Docs + backlog:"
check "quake-os/docs/CORPORATION.md"
check "docs/QUAKE-OS.md"
check "docs/QUAKE-OS-CONTINUOUS.md"
check "docs/CURSOR-AUTOMATIONS-QUICKSTART.md"
check "data/quake-os/improvement-backlog.json"

echo ""
echo "Automation prompts (paste into Cursor Automations):"
check "data/quake-os/automation-prompts/weekly-continuous.md"
check "data/quake-os/automation-prompts/pr-audit.md"
check "data/quake-os/automation-prompts/full-wave.md"
check "data/quake-os/automation-prompts/corporation-cycle.md"

echo ""
echo "Saved workflow definitions (.workflow.json):"
check "data/quake-os/automation-prompts/weekly-continuous.workflow.json"
check "data/quake-os/automation-prompts/pr-audit.workflow.json"
check "data/quake-os/automation-prompts/full-wave.workflow.json"
check "data/quake-os/automation-prompts/corporation-cycle.workflow.json"
check "data/quake-os/automation-prompts/README.md"

echo ""
echo "Automation pipeline:"
check "quake-os/core/automation-pipeline.ts"
check "quake-os/scripts/automation-run.ts"
check "docs/QUAKE-AUTOMATION-WORKFLOW.md"
check ".cursor/rules/quake-os-automation-workflow.mdc"
check ".cursor/hooks.json"

echo ""
if command -v pnpm >/dev/null 2>&1; then
  echo "Running pnpm quake:os (health)..."
  pnpm quake:os
else
  echo "⚠ pnpm not found — skip quake:os health check"
fi

echo ""
if [[ "$fail" -eq 0 ]]; then
  echo "Ready ($ok checks passed). Next: docs/CURSOR-AUTOMATIONS-QUICKSTART.md"
  exit 0
fi

echo "Fix $fail missing item(s) before creating Cursor Automations."
exit 1
