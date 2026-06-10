# PulsePoint — Supportability gates (module GA)

**Audience:** Engineering, operations, module owners  
**Purpose:** Every module promoted to **Live** must be **operable** under stress—not merely demoable.  
**Use with:** [REALIZATION-PLAN.md](./REALIZATION-PLAN.md) per-module playbook, [RUNBOOK.md](./RUNBOOK.md), [OPERATOR-CHECKLIST.md](./OPERATOR-CHECKLIST.md).

Real SaaS fails from **support burden**, not missing buttons. These gates are mandatory before flipping `lib/products.ts` to `available` or claiming a module in [PRODUCT-CLAIMS.md](./PRODUCT-CLAIMS.md).

---

## Gate checklist (all modules)

| Requirement | What “pass” looks like | Done |
|-------------|------------------------|------|
| **Explainable failures** | Staff see plain language (e.g. “Stripe webhook delayed—registration pending”) not codes | [ ] |
| **Recoverability** | Documented retry/replay: webhook replay, import re-stage, registration status fix | [ ] |
| **Operator visibility** | Failures land in `AutomationException` or module-specific queue—not silent success | [ ] |
| **Export parity** | CSV totals match on-screen counts for the same filter (members, registrations, revenue) | [ ] |
| **Human override** | ADMIN can correct bad state (cancel registration, resolve exception, revert import row) without DB access | [ ] |
| **Auditability** | Sensitive actions write `AuditLog` with actor + entity | [ ] |
| **Runbook row** | New failure modes added to [RUNBOOK.md](./RUNBOOK.md) with named owner | [ ] |
| **E2E or integration test** | Happy path + one failure path automated where feasible | [ ] |

---

## Wedge-specific (MemberCore + Events — Block 1)

| Scenario | Pass criteria |
|----------|---------------|
| **Import** | Bad row stays staged; apply is idempotent; steward can reject batch |
| **Paid registration** | PENDING → CONFIRMED via webhook; drift visible in exceptions + runbook |
| **Permission denial** | Export/import/delete without capability returns safe message, no partial leak |
| **Cross-tenant** | `pnpm leak:checks` + integration test green |

---

## Alpha → GA (Block 2 modules)

Each of Commerce, Learn, Engage, Giving, Insights repeats the full checklist **plus** module-specific runbook (money, email, credits, gifts, KPI export).

**Do not ship** custom report builders, drag/drop analytics, or multidimensional slicing in Block 2—see reporting phases in [REALIZATION-PLAN.md](./REALIZATION-PLAN.md).

### Commerce (alpha → GA)

| Scenario | Pass criteria | Owner | Done |
|----------|---------------|-------|------|
| **Dues checkout** | Stripe session completes → `CommerceOrder` CONFIRMED; member profile shows purchase | Finance + Eng | [ ] |
| **Webhook drift** | PENDING order + paid Stripe → visible in `/{orgSlug}/exceptions` with workflow `stripe.checkout.completed` | Eng | [ ] |
| **Replay** | Stripe dashboard replay does not double-apply (`claimWebhookEvent`) | Eng | [ ] |
| **Export parity** | Finance CSV row count + totals match Commerce admin list for same date filter | Finance | [ ] |
| **Human override** | ADMIN can cancel/refund order without raw SQL; `AuditLog` row exists | Eng | [ ] |
| **Failure copy** | Staff see “payment received—order still pending” not stack traces | Eng | [ ] |
| **E2E / integration** | Paid checkout happy path + one webhook-miss scenario documented | QA | [ ] |

### Giving (alpha → GA)

| Scenario | Pass criteria | Owner | Done |
|----------|---------------|-------|------|
| **Public donate** | Campaign page → checkout → `Donation.paidAt` set via webhook or demo adapter | Development | [ ] |
| **Offline gift** | Staff-recorded gift appears on campaign totals + export | Development | [ ] |
| **Acknowledgment** | Send log row or `AutomationException` on email failure—never silent | Eng | [ ] |
| **Export parity** | Gift CSV totals match campaign dashboard for same filter | Finance | [ ] |
| **Human override** | ADMIN can void mis-keyed offline gift; audit trail preserved | Eng | [ ] |
| **Failure copy** | “Donation recorded—receipt email delayed” when Resend fails | Eng | [ ] |
| **E2E / integration** | Public form validation + `tests/integration` giving paths green | QA | [ ] |

### Learn (alpha → GA)

| Scenario | Pass criteria | Owner | Done |
|----------|---------------|-------|------|
| **Staff enrollment** | `enrollMemberInCourse` creates `CourseEnrollment`; member profile shows course | Education coord | [ ] |
| **CE award** | Manual award appears on transcript + Learn admin list | Education coord | [ ] |
| **Transcript export** | `exportMemberTranscriptCsv` rows match member profile enrollments + awards | Compliance | [x] |
| **Portal transcript** | `exportPortalTranscriptCsv` + `tests/unit/portal-transcript-export.test.ts` green | Compliance | [x] |
| **Export parity** | CSV award totals = sum of on-screen CE for same member | Compliance | [ ] |
| **Human override** | ADMIN can re-enroll or award without DB access | Eng | [ ] |
| **Failure copy** | Invalid member/course returns plain error | Eng | [x] |
| **E2E / integration** | `tests/unit/learn-transcript.test.ts` + portal transcript tests green | QA | [x] |

### Insights (alpha → GA)

| Scenario | Pass criteria | Owner | Done |
|----------|---------------|-------|------|
| **Snapshot parity** | `snapshotsMatchResolved` — persisted snapshot values = live `resolveReportMetrics` | Finance | [ ] |
| **Catalog coverage** | Every `REPORT_METRIC_CATALOG` key resolves (no silent zeros) | Analytics | [ ] |
| **Board export** | CSV/snapshot export totals match Insights dashboard KPIs | Executive | [ ] |
| **Human override** | ADMIN can refresh snapshot manually | Eng | [ ] |
| **Failure copy** | Missing metric shows “unavailable” not stack trace | Eng | [ ] |
| **E2E / integration** | `tests/unit/insights-metric-parity.test.ts` green | QA | [ ] |

### Advocacy (alpha → GA)

| Scenario | Pass criteria | Owner | Done |
|----------|---------------|-------|------|
| **Public take-action** | Form validates; submit increments `responseCount`; audit log | GR lead | [ ] |
| **Tenant isolation** | Cross-org campaign submit rejected (`tests/integration/advocacy-public-isolation`) | Eng | [ ] |
| **Engage wire-up** | Launched campaign links to Engage audience | GR lead | [ ] |
| **Export parity** | Hospital participation KPI matches advocacy dashboard count | GR lead | [ ] |
| **E2E** | `tests/e2e/advocacy-take-action.spec.ts` load + submit | QA | [ ] |

### Engage (alpha → GA)

| Scenario | Pass criteria | Owner | Done |
|----------|---------------|-------|------|
| **Template approval** | Unapproved template cannot send; staff see reason | Comms lead | [ ] |
| **Segment send** | Audience from tags/attendees sends with throttle; unsubscribe honored | Comms lead | [ ] |
| **Send failure** | Provider error → `AutomationException` or send log failure row | Eng | [ ] |
| **Export parity** | Recipient export count matches audience size minus suppressions | Comms lead | [ ] |
| **Human override** | ADMIN can cancel queued send / resolve stuck batch | Eng | [ ] |
| **Failure copy** | “Send paused—check exceptions” not generic 500 | Eng | [ ] |
| **E2E / integration** | Template create + audience attach covered by unit/integration tests | QA | [ ] |

---

## Related

| Doc | Role |
|-----|------|
| [SYSTEM-DESIGN.md](./SYSTEM-DESIGN.md) | Engineering invariants |
| [UI-QUALITY-BAR.md](./UI-QUALITY-BAR.md) | Staff-facing clarity under stress |

**Last updated:** June 2026 (Sprint I — Learn, Insights, Advocacy gate rows)
