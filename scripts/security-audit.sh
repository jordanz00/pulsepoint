#!/usr/bin/env bash
# PulsePoint static security audit — run in CI and after AI sessions.
set -euo pipefail
cd "$(dirname "$0")/.."
FAIL=0

echo "== PulsePoint security audit =="

if ! bash scripts/ten-member-leak-checks.sh; then
  FAIL=1
fi

# 1. No raw tenant queries on scoped models in app code
if rg 'prisma\.(member|event|eventRegistration|memberNote|memberImportBatch|memberImportRow|auditLog|automationException)\.' \
  --glob '*.ts' --glob '*.tsx' -g '!app/generated/**' -g '!prisma/**' 2>/dev/null; then
  echo "FAIL: Use getOrgDb(orgId), not prisma.member/event in app code"
  FAIL=1
else
  echo "OK: No direct prisma tenant model access in app"
fi

# 2. requireStaffSession alone on mutations (should use requireCapability)
if rg 'requireStaffSession\(\)' app/actions --glob '*.ts' 2>/dev/null | grep -v '^$'; then
  echo "WARN: requireStaffSession in actions — prefer requireCapability"
else
  echo "OK: Actions use requireCapability"
fi

# 3. Dangerous DOM patterns
if rg '\.innerHTML\s*=' --glob '*.{ts,tsx}' -g '!node_modules/**' 2>/dev/null; then
  echo "FAIL: innerHTML assignment found"
  FAIL=1
else
  echo "OK: No innerHTML assignments"
fi

# 4. Hardcoded secrets patterns (heuristic)
if rg 'sk_live_|pk_live_|whsec_[a-zA-Z0-9]{20,}' --glob '*.{ts,tsx,js,json,md}' \
  -g '!node_modules/**' -g '!.env*' 2>/dev/null; then
  echo "FAIL: Possible live secret in repo"
  FAIL=1
else
  echo "OK: No obvious live secrets in tracked files"
fi

# 5. eval
if rg '\beval\s*\(' --glob '*.{ts,tsx,js}' -g '!node_modules/**' 2>/dev/null; then
  echo "FAIL: eval() found"
  FAIL=1
else
  echo "OK: No eval()"
fi

# 6. Demo-mode safety: refuse any tracked file that hard-codes DEMO_MODE=true
#    (committing it would risk turning the bypass on in deployed previews).
if rg '^DEMO_MODE\s*=\s*true' --glob '!.env.local' --glob '!.env.local.example' \
  -g '!node_modules/**' 2>/dev/null; then
  echo "FAIL: DEMO_MODE=true in a tracked file. Keep it in .env.local only."
  FAIL=1
else
  echo "OK: No tracked DEMO_MODE=true"
fi

bash scripts/check-sensitive-paths.sh || true
pnpm claims:validate 2>/dev/null || npx tsx scripts/validate-marketing-claims.ts

if [ "$FAIL" -eq 0 ]; then
  echo "== Audit passed =="
  exit 0
fi
echo "== Audit failed =="
exit 1
