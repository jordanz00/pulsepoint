#!/usr/bin/env bash
# Warn when sensitive auth/money paths change — human review required.
set -euo pipefail
cd "$(dirname "$0")/.."

SENSITIVE=(
  lib/permissions.ts
  lib/auth.ts
  lib/webhook-trust.ts
  lib/webhook-idempotency.ts
  app/api/webhooks/stripe/route.ts
  app/api/public/register/route.ts
  app/actions/member-import.ts
)

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repo — listing sensitive paths for manual review:"
  printf '  - %s\n' "${SENSITIVE[@]}"
  exit 0
fi

CHANGED=$(git diff --name-only HEAD 2>/dev/null || true)
STAGED=$(git diff --name-only --cached 2>/dev/null || true)
ALL=$(printf '%s\n%s' "$CHANGED" "$STAGED" | sort -u)

HIT=0
for path in "${SENSITIVE[@]}"; do
  if echo "$ALL" | grep -qx "$path"; then
    echo "SENSITIVE: $path — human review + threat model required (CONTRIBUTING.md)"
    HIT=1
  fi
done

if [ "$HIT" -eq 1 ]; then
  echo "See docs/SECURITY-PARANOID.md before merge."
  exit 0
fi
echo "OK: No sensitive path changes in current diff"
exit 0
