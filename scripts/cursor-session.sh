#!/usr/bin/env bash
# Cursor session control — status + optional full gates
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RUN_GATES=false
if [[ "${1:-}" == "--gates" ]]; then
  RUN_GATES=true
fi

echo "═══════════════════════════════════════════════════════════"
echo "  PulsePoint Cursor Session"
echo "  Workflow: docs/CURSOR-WORKFLOW.md"
echo "  Focus:    docs/PROJECT-PULSE.md"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [[ -f docs/PROJECT-PULSE.md ]]; then
  echo "── Active focus (excerpt) ──"
  awk '/^## This week/{p=1} /^## Do NOT/{p=0} p' docs/PROJECT-PULSE.md
  echo ""
fi

echo "── Repo health ──"
if git rev-parse --git-dir >/dev/null 2>&1; then
  changed="$(git status --short 2>/dev/null | wc -l | tr -d ' ')"
  last="$(git log -1 --format='%h %s' 2>/dev/null || echo 'no commits')"
  echo "  Changed files: $changed"
  echo "  Last commit:   $last"
else
  echo "  (not a git repo)"
fi
echo ""

echo "── Quick verify ──"
echo "  pnpm workflow:session --gates   # full Quake gates"
echo "  pnpm dev                        # http://localhost:3000"
echo "  pnpm quake:automation:install   # Cursor automations"
echo ""

if $RUN_GATES; then
  echo "── Running Quake OS gates ──"
  bash scripts/quake-gates.sh
  echo ""
  echo "VERDICT: PASS — safe to commit scoped files"
else
  echo "Tip: re-run with --gates before any commit or demo."
fi
