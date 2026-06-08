# Vibe-coded CRM risks — and how PulsePoint addresses them

Leadership may mandate custom build + fast iteration velocity. This doc maps common **vibe-code failure modes** to **concrete mitigations** in this repo (not generic advice).

| Risk | Symptom | PulsePoint mitigation |
|------|---------|----------------------|
| Speed over structure | Notes in spreadsheets, random fields | **`MemberNote`** model + UI; `docs/DATA-DICTIONARY.md` — where data lives |
| Technical debt | New devs can’t maintain rushed output | Module headers, `lib/permissions.ts`, tests in `tests/unit/`, docs suite |
| Fragile data architecture | Siloed inconsistent data | Prisma schema + Zod validation; import dedup; email normalization |
| Security / compliance gaps | UI-only roles, GDPR afterthought | `requireCapability()`; `docs/SUBPROCESSORS.md` + privacy page |
| Import cutover disaster | Blind CSV → production | **Staging** `MemberImportBatch` → `/{orgSlug}/members/imports` → apply |
| Integration roadblocks | Bespoke glue per tool | `docs/INTEGRATIONS.md`, `GET /api/health`, webhook idempotency |
| No official support | Peak season outage, no runbook | `docs/RUNBOOK.md`, `AutomationException` queue at `/{orgSlug}/exceptions` |

## Still roadmap (do not oversell)

- Postgres RLS (second isolation layer) — see `prisma/sql/rls-reference.sql`
- Full GDPR delete/export workflow
- Public REST API v1 (documented contract only today)
- Chapter-scoped roles

See **`docs/ENGINEERING-INVARIANTS.md`** for the eight leadership process rules mapped to code.

See `docs/OPERATOR-CHECKLIST.md` for Red / Yellow / Green status.
