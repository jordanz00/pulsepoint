#!/usr/bin/env bash
# Remind to run gates after agent session when files under app/lib/components changed.
set -euo pipefail
input="$(cat)"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [[ ! -f "$ROOT/scripts/quake-gates.sh" ]]; then
  echo '{}'
  exit 0
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
  "followup_message": "Quake OS: ${CHANGED} app/lib/component file(s) touched this session. Run \`pnpm quake:gates\` before PR. Pipeline: \`pnpm quake:automation:run\`."
}
EOF
else
  echo '{}'
fi
