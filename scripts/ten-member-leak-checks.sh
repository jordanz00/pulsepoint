#!/usr/bin/env bash
# Ten checks — prevent cross-association member list leaks.
# Run: pnpm leak:checks  (also invoked from pnpm security:audit)
set -euo pipefail
cd "$(dirname "$0")/.."
FAIL=0
PASS=0

ok() { echo "  OK: $1"; PASS=$((PASS + 1)); }
bad() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

grepq() {
  grep -q "$@" 2>/dev/null
}

grepl() {
  grep -rE "$@" --include='*.ts' --include='*.tsx' . 2>/dev/null \
    | grep -v node_modules \
    | grep -v app/generated \
    | grep -v '^\./prisma/' \
    | grep -v '^\./scripts/' || true
}

echo "== Ten member leak checks (association data isolation) =="

# 1. No raw prisma access to tenant Member table (app code only)
echo "[1/10] No prisma.member in application code"
if grepl 'prisma\.member\.' | grep -v '^\./tests/' | grep -q .; then
  grepl 'prisma\.member\.' | grep -v '^\./tests/' | head -5
  bad "Direct prisma.member — use getOrgDb(orgId).member"
else
  ok "No prisma.member bypass"
fi

# 2. Member registered as org-scoped model
echo "[2/10] Member in ORG_SCOPED_MODELS"
if grepq '"Member"' lib/org-models.ts || grepq "'Member'" lib/org-models.ts; then
  ok "Member in org-models registry"
else
  bad "Member missing from lib/org-models.ts"
fi

# 3. Files querying members must use getOrgDb
echo "[3/10] member.* queries co-located with getOrgDb"
LEAK_FILES=0
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  file="${f%%:*}"
  if ! grepq 'getOrgDb' "$file"; then
    echo "    -> $file has member query without getOrgDb"
    LEAK_FILES=$((LEAK_FILES + 1))
  fi
done < <(grepl '\.member\.(findMany|findFirst|create|update|delete|count)' | grep -v '^\./tests/' || true)
if [[ "$LEAK_FILES" -gt 0 ]]; then
  bad "$LEAK_FILES file(s) query member without getOrgDb"
else
  ok "All member query files use getOrgDb"
fi

# 4. Admin shell enforces org membership (URL slug IDOR)
echo "[4/10] Admin layout membership gate"
LAYOUT='app/[orgSlug]/(admin)/layout.tsx'
if grepq 'requireOrgAccessForSlug' "$LAYOUT"; then
  ok "requireOrgAccessForSlug on admin layout"
else
  bad "Admin layout missing requireOrgAccessForSlug"
fi

# 5. CSV export gated by member:export (ADMIN)
echo "[5/10] Export requires member:export capability"
if grepq 'member:export' app/actions/members.ts; then
  ok "exportMembersCsv uses member:export"
else
  bad "exportMembersCsv missing member:export"
fi

# 6. Runtime tenant guard on list/export path
echo "[6/10] Runtime assertAllRowsBelongToOrg on fetchMembers"
if grepq 'assertAllRowsBelongToOrg' app/actions/members.ts; then
  ok "fetchMembers guarded"
else
  bad "fetchMembers missing assertAllRowsBelongToOrg"
fi

# 7. No public HTTP API returns member lists
echo "[7/10] No member list in app/api routes"
if grep -rE '\.member\.(findMany|findFirst)' app/api --include='*.ts' 2>/dev/null | grep -q .; then
  grep -rE '\.member\.(findMany|findFirst)' app/api --include='*.ts' 2>/dev/null | head -5
  bad "app/api route queries member table"
else
  ok "No member list endpoints in app/api"
fi

# 8. Integration test exists
echo "[8/10] Cross-tenant integration test present"
if [[ -f tests/integration/member-tenant-isolation.test.ts ]]; then
  ok "integration test file exists"
else
  bad "missing tests/integration/member-tenant-isolation.test.ts"
fi

# 9. Unit tests for tenant guards
echo "[9/10] Unit tests for tenant-guards"
if [[ -f tests/unit/tenant-guards.test.ts ]]; then
  ok "tenant-guards unit tests"
else
  bad "missing tests/unit/tenant-guards.test.ts"
fi

# 10. Audit on export
echo "[10/10] Member export writes audit log"
if grepq 'member.exported' app/actions/members.ts && grepq 'writeAuditLog' app/actions/members.ts; then
  ok "export audited"
else
  bad "exportMembersCsv missing audit log"
fi

echo ""
echo "Result: $PASS passed, $FAIL failed"
if [[ "$FAIL" -gt 0 ]]; then
  echo "Fix failures before pilot — cross-association member list leak risk."
  exit 1
fi
echo "All ten member leak checks passed."
exit 0
