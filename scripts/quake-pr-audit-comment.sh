#!/usr/bin/env bash
# Post Quake OS audit comment on a pull request (CI complement to Cursor Automations).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PR_NUMBER="${1:-${GITHUB_EVENT_PULL_REQUEST_NUMBER:-}}"
if [[ -z "$PR_NUMBER" ]]; then
  echo "Usage: quake-pr-audit-comment.sh <pr-number>"
  exit 1
fi

CLAIMS="pass"
LEAKS="pass"
CLAIMS_OUT=""
LEAKS_OUT=""

if ! CLAIMS_OUT="$(pnpm exec tsx scripts/validate-marketing-claims.ts 2>&1)"; then
  CLAIMS="fail"
fi

if ! LEAKS_OUT="$(bash scripts/ten-member-leak-checks.sh 2>&1)"; then
  LEAKS="fail"
fi

# Heuristic file review on changed files
DIFF_FILES="$(gh pr diff "$PR_NUMBER" --name-only 2>/dev/null || git diff --name-only origin/main...HEAD 2>/dev/null || true)"
RISK_LINES=""

if echo "$DIFF_FILES" | grep -qE 'prisma/schema\.prisma|lib/tenant|getOrgDb'; then
  RISK_LINES="${RISK_LINES}\n⚠ tenant: schema/tenant paths touched → verify getOrgDb + leak:checks"
fi
if echo "$DIFF_FILES" | grep -qE 'docs/PRODUCT-CLAIMS|app/\(marketing\)'; then
  RISK_LINES="${RISK_LINES}\n⚠ claims: marketing/claims paths → run claims:validate"
fi
if echo "$DIFF_FILES" | grep -qE 'app/api/|app/actions/'; then
  RISK_LINES="${RISK_LINES}\n⚠ mutations: API/actions → requireCapability + tenant scope"
fi

if [[ "$CLAIMS" == "pass" && "$LEAKS" == "pass" && -z "$RISK_LINES" ]]; then
  VERDICT="APPROVED"
elif [[ "$CLAIMS" == "fail" || "$LEAKS" == "fail" ]]; then
  VERDICT="NEEDS REVISION"
else
  VERDICT="NEEDS REVISION"
fi

BODY="## Quake OS audit (automated)

✔ claims: ${CLAIMS} — marketing claims check
✔ tenant-leaks: ${LEAKS} — ten-member leak checks
${RISK_LINES:-✔ diff: no high-risk path patterns flagged}

**VERDICT:** ${VERDICT}

**Sources:** \`scripts/validate-marketing-claims.ts\`, \`scripts/ten-member-leak-checks.sh\`, PR diff paths

_Full gates run in \`quake-gates.yml\`. Cursor agent review: \`.cursor/agents/quake-os-audit.md\`_"

gh pr comment "$PR_NUMBER" --body "$BODY"

echo "Posted audit comment on PR #$PR_NUMBER ($VERDICT)"
