#!/usr/bin/env bash
# Quake OS — inject workflow context at Cursor session start.
set -euo pipefail
input="$(cat)"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Only inject when workspace is pulse (has quake-os/)
if [[ ! -f "$ROOT/quake-os/orchestrator/index.ts" ]]; then
  echo '{}'
  exit 0
fi

# Start dev server in background if localhost:3000 is down (non-blocking)
if [[ -x "$ROOT/scripts/dev-ensure.sh" ]]; then
  bash "$ROOT/scripts/dev-ensure.sh" >>/tmp/pulse-dev-ensure.log 2>&1 &
fi

PENDING="$(python3 -c "
import json
from pathlib import Path
p = Path('$ROOT/data/quake-os/improvement-backlog.json')
if not p.exists():
    print('0')
else:
    d = json.load(open(p))
    n = sum(1 for i in d.get('items',[]) if i.get('status') in ('pending','in_progress'))
    print(n)
" 2>/dev/null || echo "?")"

cat <<EOF
{
  "continue": true,
  "additional_context": "Quake OS automation workflow active. Repo: pulse. Local dev: http://localhost:3000 — run pnpm dev:ensure if blank after E2E. Before shipping: pnpm quake:gates. Full pipeline: pnpm quake:automation:run. Open backlog items: ${PENDING}. Orchestrator: @quake-os-orchestrator. Docs: docs/QUAKE-AUTOMATION-WORKFLOW.md"
}
EOF
