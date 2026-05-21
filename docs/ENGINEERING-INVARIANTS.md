# Engineering invariants (process → code)

Maps leadership/process rules to repo enforcement.

| # | Rule | Enforcement |
|---|------|-------------|
| 1 | Invariants ship with features | `getOrgDb`, `requireCapability`, `registration-state` / `event-state`, webhook idempotency |
| 2 | Human review on auth/money paths | `CONTRIBUTING.md`, `scripts/check-sensitive-paths.sh` |
| 3 | Soft-fail automations | `lib/automation.ts`, `AutomationException`, `/{orgSlug}/exceptions` |
| 4 | Import staging, not blind prod insert | `member-import.ts`, `/{orgSlug}/members/imports` |
| 5 | Marketing matches enforcement | `docs/PRODUCT-CLAIMS.md`, `pnpm claims:validate` |
| 6 | Runbooks with owner + replay | `docs/RUNBOOK.md` |
| 7 | Subprocessors documented | `docs/SUBPROCESSORS.md`, `app/privacy/page.tsx` |
| 8 | Narrow wedge, not Protech clone | `docs/SCOPE.md` |
