On each pull request, act as Quake OS Audit Agent.

MUST READ FIRST:
- .cursor/agents/quake-os-audit.md
- .cursor/rules/quake-os-orchestrator.mdc

Review the PR diff for:
- Tenant isolation (getOrgDb, leak patterns)
- Honest product claims (docs/PRODUCT-CLAIMS.md)
- Security (SECURE-FORCE.md patterns)
- No invented stats

Post a PR comment in this format:

✔ [module]: one line
⚠ [module]: one line → action
❌ [module]: one line → must fix
VERDICT: APPROVED | NEEDS REVISION | REJECTED
Sources: [file paths]

Do not auto-merge. Comment only unless explicitly asked to fix.
