#!/usr/bin/env bash
# Remind to run gates after agent session; restore localhost:3000 if E2E stopped dev.
set -euo pipefail
input="$(cat)"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [[ ! -f "$ROOT/scripts/quake-gates.sh" ]]; then
  echo '{}'
  exit 0
fi

# Restore dev server after Playwright / long gate runs
if [[ -x "$ROOT/scripts/dev-ensure.sh" ]]; then
  bash "$ROOT/scripts/dev-ensure.sh" >>/tmp/pulse-dev-ensure.log 2>&1 || true
fi

# sessionStop payload may include edited files — if unavailable, skip quietly
CHANGED="$(echo "$input" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    files = d.get('edited_files') or d.get('files') or []
    hits = [f for f in files if f.startswith(('app/','lib/','components/','prisma/'))]
    print(len(hits))
except Exception:
    print(0)
" 2>/dev/null || echo 0)"

if [[ "$CHANGED" -gt 0 ]]; then
  cat <<EOF
{
  "followup_message": "Quake OS: ${CHANGED} app/lib/component file(s) touched. Run \`pnpm quake:gates\` before PR. Local preview: http://localhost:3000 — if blank, \`pnpm dev:ensure\`."
}
EOF
else
  cat <<EOF
{
  "followup_message": "Local preview: http://localhost:3000 — if the page is blank, run \`pnpm dev:ensure\` (E2E and quake:execute stop the dev server)."
}
EOF
fi
