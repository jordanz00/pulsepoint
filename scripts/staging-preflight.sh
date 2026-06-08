#!/usr/bin/env bash
# Staging preflight — Sprint A engineering prep (no deploy)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== PulsePoint staging preflight (Sprint A / BL-003) =="
echo "Docs: docs/STAGING-LAUNCH.md · docs/ENTRA-PILOT-SETUP.md · docs/STRIPE-PILOT-DRILL.md"
echo ""

WARN=0
need() {
  local key="$1"
  local doc="$2"
  if [[ -z "${!key:-}" ]]; then
    echo "  ☐ ${key} — see ${doc}"
    WARN=1
  else
    echo "  ✓ ${key}"
  fi
}

# Load .env.staging if present
if [[ -f .env.staging ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.staging
  set +a
  echo "Loaded .env.staging"
else
  echo "No .env.staging — checking process env only"
fi

echo ""
echo "Required for pilot staging:"
need DATABASE_URL "docs/STAGING-LAUNCH.md"
need NEXT_PUBLIC_APP_URL "docs/STAGING-LAUNCH.md"
need ENTRA_TENANT_ID "docs/ENTRA-PILOT-SETUP.md"
need ENTRA_CLIENT_ID "docs/ENTRA-PILOT-SETUP.md"
need ENTRA_CLIENT_SECRET "docs/ENTRA-PILOT-SETUP.md"
need ENTRA_SESSION_SECRET "docs/ENTRA-PILOT-SETUP.md"

echo ""
echo "Stripe pilot (after Entra):"
need STRIPE_SECRET_KEY "docs/STRIPE-PILOT-DRILL.md"
need STRIPE_WEBHOOK_SECRET "docs/STRIPE-PILOT-DRILL.md"

echo ""
echo "Engineering gates (local):"
pnpm claims:validate
pnpm leak:checks

if [[ "${WARN}" -eq 0 ]]; then
  echo ""
  echo "Preflight: env looks complete — proceed with STAGING-LAUNCH deploy + smoke script"
  exit 0
fi

echo ""
echo "Preflight: INCOMPLETE — fill gaps above, then deploy per docs/STAGING-LAUNCH.md"
exit 1
