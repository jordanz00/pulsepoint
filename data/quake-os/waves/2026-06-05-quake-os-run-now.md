# Quake OS Wave — Run Now

**Date:** 2026-06-05  
**Orchestrator:** quake-os-orchestrator  
**Mode:** Full agency execution (gates + Advocacy take-action MVP)

---

## Gates (pre-flight)

| Gate | Result |
|------|--------|
| `pnpm claims:validate` | ✅ OK |
| `pnpm leak:checks` | ✅ 10/10 |
| `pnpm test` | ✅ 88 passed |
| `generate-status-board.py` | ✅ `status-board.html` |

---

## Phase 3 — Build (this run)

### Advocacy take-action MVP ✅

| Deliverable | Path |
|-------------|------|
| Campaign fields: audienceId, targetCount, responseCount | `prisma/schema.prisma`, migration SQL |
| Server actions: create issue, create campaign, launch take-action | `app/actions/advocacy.ts` |
| Staff UI: add issue, start campaign, launch Engage audience | `components/advocacy/advocacy-quick-actions.tsx` |
| Campaign progress bars (marketing parity) | `enterprise/advocacy/page.tsx` |
| Demo seed participation counts | `prisma/seed-demo.ts` |
| Schema unit tests | `tests/unit/advocacy-actions-schema.test.ts` |

**Flow:** Issue → Campaign → Launch → `EmailAudience` (ACTIVE members) → staff sends from Engage.

---

## Phase 4 — Audit

```
✔ tenant: advocacy actions use getOrgDb + advocacy:write capability
✔ audit: issue/campaign create + launch logged
✔ claims: PRODUCT-CLAIMS + platform-capabilities updated for take-action alpha
✔ ux: progress bars + quick actions; hospital KPIs retained
⚠ response capture: manual seed counts only — no public take-action form yet
⚠ legislative feed: still roadmap
⚠ pilot ops: staging/Entra/Stripe/owners — human ☐
VERDICT: APPROVED (engineering wave)
Sources: app/actions/advocacy.ts, enterprise/advocacy/page.tsx, pnpm test/leak/claims
```

---

## Phase 6 — Executive

| Role | Decision |
|------|----------|
| **CEO** | SHIP Advocacy alpha MVP — OK to demo take-action loop locally/staging |
| **COO** | Human sprint unchanged: staging, Entra, Stripe drill, playbook owners |
| **CTO** | Run `prisma db push` locally; Postgres staging needs migration `20250605180000_advocacy_take_action` |

**KPIs:** Take-action launched count visible on Advocacy dashboard ✅

---

## Human next (COO)

1. `docs/PILOT-PLAYBOOK.md` — assign owners  
2. Staging deploy + Entra users  
3. Stripe drill → `PULSE_CRON_RENEWALS=true`  
4. Protech import dry-run  
5. Public take-action form (roadmap P3)
