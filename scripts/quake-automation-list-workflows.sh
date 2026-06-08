#!/usr/bin/env bash
# List saved Cursor Automation workflow JSON files (repo-scoped; exit 0 when found).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROMPTS="$ROOT/data/quake-os/automation-prompts"

if [[ ! -d "$PROMPTS" ]]; then
  echo "Missing: $PROMPTS" >&2
  exit 1
fi

shopt -s nullglob
files=("$PROMPTS"/*.workflow.json)

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No *.workflow.json in $PROMPTS" >&2
  exit 1
fi

printf '%s\n' "${files[@]}"
exit 0
