#!/usr/bin/env bash
# Install a user crontab for free local backup + optional health (macOS/Linux).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MARK="# pulsepoint-continuity"

crontab -l 2>/dev/null | grep -v "$MARK" > /tmp/pulse-crontab.txt || true

cat >> /tmp/pulse-crontab.txt <<EOF
0 2 * * * cd $ROOT && pnpm continuity:backup $MARK
0 3 * * 0 cd $ROOT && pnpm continuity:export $MARK
EOF

if [[ -n "${PRIMARY_URL:-}" ]]; then
  echo "*/15 * * * * cd $ROOT && PRIMARY_URL=$PRIMARY_URL pnpm continuity:health $MARK" >> /tmp/pulse-crontab.txt
fi

crontab /tmp/pulse-crontab.txt
rm /tmp/pulse-crontab.txt
echo "Installed crontab entries (daily backup, weekly warehouse export)."
echo "Optional: PRIMARY_URL=https://your.vercel.app bash $0  # adds 15-min health checks"
