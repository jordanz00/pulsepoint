# Quake OS — Sprint J (staff-visible exports + parity hardening)

**Date:** 2026-06-08  
**Follows:** Sprint I (`2026-06-08-sprint-i-wave.md`)  
**Theme:** Ship what stakeholders can *click* — CE transcript, renewals pulse, export parity tests

---

## Shipped

| ID | Item | Artifact |
|----|------|----------|
| BL-028 | Member profile CE transcript download | `MemberTranscriptExportButton`, wired on member profile Learn panel |
| BL-029 | Giving export parity helpers + tests | `lib/giving/csv-export.ts`, `tests/unit/giving-export-parity.test.ts` |
| BL-030 | Commerce webhook idempotency guard | `lib/commerce/webhook-idempotency.ts`, Stripe route + unit test |
| BL-031 | Renewals pulse + CSV export | `RenewalsSummaryPanel`, `exportRenewalsDueCsv`, cron gate label |
| BL-032 | Commerce mark-paid helper + webhook refactor | `lib/commerce/mark-order-paid.ts`, Stripe route uses shared path |
| BL-033 | Communities document link MVP | `document-url.ts`, admin space page, portal docs list, audit on add |
| BL-034 | Executive KPI number component | `ExecutiveKpiNumber` wired in insights + hero previews |
| BL-035 | Quake Execute workflow | `pnpm quake:execute`, `docs/QUAKE-EXECUTE-WORKFLOW.md` |

---

## Demo script (90 seconds)

1. **`/demo-healthcare/members/{id}`** — Workforce & Learn → **Download CE transcript** (staff w/ learn:manage)
2. **`/demo-healthcare/members/renewals`** — Renewal pulse KPIs, cron gate badge, **Export renewals CSV**
3. **`/demo-healthcare/communities/{space}`** — add https document link; portal shows doc list
4. **Marketing homepage** — executive overview KPIs: `$284K` on one line (prefix + digits + suffix)
5. **`pnpm quake:execute 2026-06-08-sprint-j`** — full ship proof

---

## Gates

```bash
pnpm quake:execute 2026-06-08-sprint-j
```

**Audit:** APPROVED (post-gates)

---

## Sprint K — candidates

1. Member profile transcript on portal (member self-service)
2. Giving campaign detail export parity integration test (DB fixture)
3. Communities document upload MVP (alpha)
4. BL-003 staging pilot — human operator
