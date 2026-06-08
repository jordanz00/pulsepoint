# PulsePoint operator checklist (one page)

**For:** Leadership, IT, operations  
**As of:** May 2026  
**How to read:** 🟢 Pilot-ready · 🟡 In progress (documented gap) · 🔴 Not ready to claim or scale  

**Overall:** 🟡 **Controlled pilot** — foundation is in place; finish ops ownership and production drill before broad go-live or grant claims beyond MemberCore + Events.

**Strategic mode:** Option A — production-grade **pilotable** AMS first ([REALIZATION-PLAN.md](./REALIZATION-PLAN.md)). Sellable multi-customer SaaS (Option B) after one successful pilot cycle.

---

## Status at a glance

| Area | Status | What this means for the org |
|------|--------|-----------------------------|
| **Multi-tenant data isolation** | 🟢 | `getOrgDb()` + **10 leak checks** (`pnpm leak:checks`); runtime `assertAllRowsBelongToOrg`; integration test when `DATABASE_URL` set. Postgres RLS still reference-only. |
| **Roles & permissions (server-side)** | 🟢 | Export, import, delete require real capabilities (ADMIN where required)—not UI-only. Clerk org roles must match staff reality. |
| **Member directory & staff notes** | 🟢 | One member record; notes in `MemberNote` (not spreadsheets in custom fields). |
| **Member detail one-screen (wedge)** | 🟢 | Summary tab: tags, event registrations, compact notes + jump links to deeper tabs (`UI-QUALITY-BAR` contrast on light inset). |
| **Member import / cutover** | 🟢 | CSV → **stage → review → apply** at `/{orgSlug}/members/imports`. Safe for sandbox and disciplined cutover. |
| **Events & registration (free)** | 🟢 | Publish panel + draft/create flow, public register, capacity/waitlist, check-in (≥44px), registration state rules. |
| **Paid events (Stripe)** | 🟡 | Signed webhooks, idempotency, metadata checks, PENDING→CONFIRMED state machine. **Needs:** live Stripe + one runbook drill with named owner. |
| **Automation failures (email, etc.)** | 🟢 | Non-fatal steps queue to `/{orgSlug}/exceptions`—not silent Zapier-style failure. |
| **Public registration abuse** | 🟢 | IP/org/email rate limits + email send cap on open registration. |
| **Audit trail** | 🟢 | Key actions logged (import, export, delete, registration, payment). |
| **Marketing vs reality** | 🟢 | Live/Roadmap labels; `pnpm claims:validate` in CI. Alpha modules labeled honestly in decks. |
| **Pilot onboarding UX** | 🟢 | Home checklist guides empty orgs through MemberCore + Events wedge (`docs/PILOT-SETUP-CHECKLIST.md`). |
| **Alpha modules in product** | 🟡 | Learn, Giving, Commerce, Engage, Insights have admin UIs; **do not** claim GA until checklist green. |
| **Privacy & subprocessors** | 🟡 | `docs/SUBPROCESSORS.md` + privacy page for IT questionnaires. **Needs:** counsel-approved privacy policy before public launch. |
| **GDPR / formal data rights** | 🔴 | Admin CSV export + delete rules today; automated DSAR/portability **not** shipped. |
| **Runbooks & on-call** | 🟡 | `docs/RUNBOOK.md` covers Stripe drift, import mistakes, email failures. **Needs:** named owners per runbook before peak traffic. |
| **Production environment** | 🟡 | `docs/DEPLOY.md` (Vercel + Neon + Clerk + Stripe). **Needs:** org-specific prod deploy + webhook registration + smoke checklist signed off. |
| **CI quality gate** | 🟢 | Typecheck, lint, unit tests, security audit, migrations, build on `main`. |
| **End-to-end tests in CI** | 🟢 | Playwright demo wedge in `.github/workflows/e2e.yml` (parallel to `ci.yml`). |
| **Sensitive-path review** | 🟢 | `CONTRIBUTING.md` + review script; human review on webhooks/permissions/import apply. |

---

## What leadership can say today (accurate)

- “We are building **PulsePoint**, our own modular AMS—**MemberCore** and **PulsePoint Events** are the live wedge.”
- “Data is **multi-tenant by design**; exports and imports are **controlled and audited**.”
- “**Learn, Commerce, Insights, Giving, and Engage** are **alpha** today—labeled honestly on the site; we are not claiming them as fully shipped in grants.”
- “**Permissions, payments, and migration** are engineered and reviewed by our team—not bolted on after the fact.”

---

## Go-live gates (module = MemberCore + Events)

| Gate | Status |
|------|--------|
| Tenant isolation tests pass (`pnpm test`) | 🟢 |
| Role matrix matches real Clerk ADMIN/STAFF | 🟡 Assign per org |
| Import cutover uses stage → review → apply | 🟢 |
| Stripe webhook runbook exercised once | 🟡 |
| Named runbook owner (payments + imports) | 🟡 |
| Marketing/deck aligned with `docs/PRODUCT-CLAIMS.md` | 🟢 |
| Counsel-approved privacy policy live | 🔴 |
| Production deploy + webhooks + smoke checklist | 🟡 |

**Pilot:** 🟡 when yellow ops rows have owners and one Stripe drill.  
**Broad production / grant module claims beyond wedge:** blocked on 🔴 privacy/DSAR and 🟡 prod hardening.

---

## What you’re doing right (foundation-first)

This is **not** a blind vibe-coded CRM:

- Multi-tenant `orgId` + `getOrgDb()` from day one  
- Webhook signatures + idempotency  
- Audit logging on key actions  
- Honest Live/Roadmap on product marketing (CI-enforced)  
- PII-only scope (no accidental PHI platform)  
- Security audit + rate limits on public registration  

**The work ahead is finishing the unglamorous layer**—owners, production drill, legal text—not restarting the build.

---

## Next 30 days (operator priorities)

1. Name **runbook owners** (Stripe paid / DB pending; import cutover).  
2. Run **one production Stripe registration** end-to-end; resolve any exception in-queue.  
3. Route privacy page to **counsel**; keep subprocessors table current.  
4. Complete **DEPLOY.md** smoke checklist on production URL.  
5. Train data steward on **imports review** page before legacy CSV cutover.

---

## Detail docs

| Doc | Use |
|-----|-----|
| `docs/REALIZATION-PLAN.md` | Operational trust, 18-month blocks, Option A locked |
| `docs/UI-QUALITY-BAR.md` | Enforceable admin UI standards |
| `docs/SUPPORTABILITY-GATES.md` | Module GA operability checklist |
| `docs/PROJECT-BRIEF.md` | Full narrative for leadership |
| `docs/PRODUCT-CLAIMS.md` | What may appear in decks |
| `docs/RUNBOOK.md` | Incident steps |
| `docs/EXCEPTIONS-DRILL.md` | Email-fail → exceptions queue drill |
| `docs/DEMO-SCRIPT-15MIN.md` | Leadership wedge demo (15 min) |
| `docs/WEDGE-UI-AUDIT.md` | Sprint E UI-QUALITY-BAR wedge pass |
| `docs/SCOPE.md` | Wedge vs Protech parity |
| `docs/SUBPROCESSORS.md` | IT questionnaire |

**Commands (engineering):** `pnpm test` · `pnpm security:audit` · `pnpm claims:validate` · `pnpm db:migrate`
