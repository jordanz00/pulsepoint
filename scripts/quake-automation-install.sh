#!/usr/bin/env bash
# Open pulse in Cursor and print Quake OS automation install steps.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROMPTS="$ROOT/data/quake-os/automation-prompts"

echo "Quake OS — Cursor Automation install"
echo "Repo: jordanz00/pulsepoint · branch: main"
echo ""

if [[ -d "$PROMPTS" ]]; then
  echo "Saved workflows:"
  for f in "$PROMPTS"/*.workflow.json; do
    name="$(python3 -c "import json; print(json.load(open('$f'))['name'])")"
    echo "  • $name"
    echo "    $f"
  done
else
  echo "Missing: $PROMPTS"
  exit 1
fi

echo ""
echo "Install (Cursor UI):"
echo "  1. Automations → New (repeat for each workflow)"
echo "  2. Or Agents Window: \"Create automations from data/quake-os/automation-prompts/*.workflow.json\""
echo "  3. Save each automation"
echo ""
echo "Docs: docs/CURSOR-AUTOMATIONS-QUICKSTART.md"
echo ""

if command -v pbcopy >/dev/null 2>&1; then
  pbcopy < "$PROMPTS/weekly-continuous.md"
  echo "Copied weekly-continuous.md instructions to clipboard."
fi

if [[ "$(uname)" == "Darwin" ]]; then
  open -a Cursor "$ROOT" 2>/dev/null || true
fi
