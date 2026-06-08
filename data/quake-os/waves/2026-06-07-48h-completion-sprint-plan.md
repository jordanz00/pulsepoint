# Quake OS — 48-Hour Gap Closure Sprint Plan

**Date:** 2026-06-07  
**Orchestrator:** quake-os-orchestrator  
**Repo:** `/Users/jordanzabady/Desktop/pulse`  
**Sources:** `2026-06-05-membership-advocacy-pilot-wave.md`, `2026-06-05-triple-initiative-execution.md`, `improvement-backlog.json`, `REALIZATION-PLAN.md`, `PILOT-EXECUTION-STATUS.md`, session work log (marketing + giving + pilot checklist)

---

## Executive summary

| Bucket | Status (48h window) | Verdict |
|--------|---------------------|---------|
| **Marketing flagship bands** | ✅ Shipped | Insights, MemberCore, Association spine, Advocacy, PAC, Enterprise integrations |
| **Giving / fundraising module** | ✅ Shipped | Actions, UI, tests, `docs/FUNDRAISING.md` |
| **Pilot setup checklist** | ✅ Shipped | `pilot-setup-checklist.ts`, admin UI, CSS, docs, unit tests |
| **Advocacy backend (alpha)** | ✅ Shipped | CRUD + launch + public form + `AdvocacyCampaignResponse` |
| **Advocacy admin UX** | ✅ Shipped | Bill deck, PAC bars, Engage audience links, hospital KPIs |
| **Pilot ops (human)** | 🔴 Open | Sprint A only — `docs/SPRINT-A-OPERATOR-PACKET.md` |
| **Membership scale** | ✅ Shipped | Cursor virtual directory + bulk facility assign panel |
| **Wedge polish** | ✅ Shipped | `WEDGE-UI-AUDIT.md`, mobile pass, E2E wedge, demo script |
| **Explicitly cancelled** | — | Committee roster workflow; staff-access admin (per product owner) |

**CEO verdict:** Engineering can close **Sprints B–F** in-repo. **Sprint A** blocks external pilot and must run in parallel with human owners.

---

## Sprint A — Pilot Ops Gate (P0 · Human + COO)

**Initiative:** `BL-003` · `PILOT-EXECUTION-STATUS` Day-30 · `REALIZATION-PLAN` Block 1 production row  
**Duration:** 5–7 calendar days  
**Owner:** Human IT/Leadership · `quake-os-coo` tracks

### Goal
Staging association can run the 30-min smoke script with real Entra, Stripe, and named runbook owners.

### Tasks
| # | Task | Owner | Acceptance |
|---|------|-------|------------|
| A1 | Deploy staging per `docs/STAGING-LAUNCH.md` | IT | URL live; `demo-healthcare` or pilot slug consistent across Entra redirect |
| A2 | Entra app + 3–5 pilot users | IT | `docs/ENTRA-PILOT-SETUP.md` checklist signed |
| A3 | Stripe pilot drill | Finance + Eng | `docs/STRIPE-PILOT-DRILL.md` pass; paid reg E2E on staging |
| A4 | Enable `PULSE_CRON_RENEWALS=true` on staging **only** after A3 | Eng | Cron gates already shipped (`lib/jobs/cron-gates.ts`) |
| A5 | Named owners in `docs/PILOT-PLAYBOOK.md` | Leadership | Every `RUNBOOK.md` scenario has a name |
| A6 | Protech CSV dry-run: stage → review → apply | Data steward | `docs/PROTECH-IMPORT.md` on staging org |
| A7 | Counsel-approved privacy policy | Legal | Gate before public marketing push |

### Quake OS phases
1. **Research** — `quake-os-coo` confirms slug + env parity (`STAGING-LAUNCH` vs `ENTRA-PILOT-SETUP`)
2. **Planning** — Day-30 table in `PILOT-EXECUTION-STATUS.md` updated with dates
3. **Build** — Human execution (no code required for A1/A2/A5/A7)
4. **Audit** — `pnpm leak:checks`, `pnpm claims:validate`, `pnpm test:e2e` on staging URL
5. **Optimize** — Screenshot `status-board.html` + deck assets
6. **Executive** — CEO SHIP when A1–A7 checked

### Exit criteria
- [ ] Staging smoke script green
- [ ] `PILOT-EXECUTION-STATUS.md` all Day-30 rows ✅

---

## Sprint B — Advocacy Take-Action MVP (P1 · Engineering)

**Initiative:** `BL-001` · Wave gap “Advocacy take-action loop”  
**Duration:** 1 sprint (~5 dev days)  
**Agents:** `quake-os-backend`, `quake-os-hospital-association`, `quake-os-frontend`, `quake-os-security`, `quake-os-qa`

### Goal
Government affairs staff can launch a campaign → members respond → response count updates without manual `+1` only.

### Current state (shipped)
- `app/actions/advocacy.ts` — issue/campaign CRUD, `launchAdvocacyTakeAction`, `recordAdvocacyResponse`
- `components/advocacy/advocacy-quick-actions.tsx` — staff forms
- `enterprise/advocacy/page.tsx` — hospital KPIs, glass shell

### Remaining build
| # | Task | Files / notes |
|---|------|----------------|
| B1 | Public take-action route (org-scoped slug, campaign id) | New `app/[orgSlug]/(public)/advocacy/...` or embed on event microsite pattern |
| B2 | Validated payload → `recordAdvocacyResponse` or new `submitAdvocacyResponse` (member/hospital id, rate limit) | `app/actions/advocacy.ts`, Zod schema |
| B3 | Wire Engage send after `launchAdvocacyTakeAction` (optional template stub) | `engage` routes or action callback |
| B4 | Admin UI: progress bars match `advocacy-marketing-preview.tsx` | `enterprise/advocacy/page.tsx`, `pulse-surfaces.css` |
| B5 | Unit + integration tests for public path | `tests/unit/advocacy-*.test.ts` |
| B6 | Semgrep pass on new paths | `BL-007` partial |

### Quake OS phases
1. **Research** — `quake-os-hospital-association` — persona: GR staff launch + hospital executive response
2. **Planning** — `quake-os-product-manager` — spec: public form fields, no PHI, alpha labels
3. **Build** — B1–B4
4. **Audit** — `quake-os-security` (rate limit, capability), `quake-os-audit`, `pnpm leak:checks`
5. **Optimize** — `quake-os-ux` — empty states, “Launch” CTA prominence
6. **Executive** — Update `platform-capabilities.ts` + `PRODUCT-CLAIMS.md` only if form ships; keep legislative feed roadmap

### Exit criteria
- [x] Staff launch → Engage audience created (existing)
- [x] Public link records response without staff `+1`
- [x] Marketing claim “take-action” matches admin capability
- [x] `pnpm test` green (unit tests for validation + adapter stub)

---

## Sprint C — Advocacy Admin Parity (P2 · Design + Frontend)

**Initiative:** `BL-004` (admin half) · Wave “Advocacy UX”  
**Duration:** 3–4 dev days (can overlap Sprint B tail)  
**Agents:** `quake-os-designer`, `quake-os-ux`, `quake-os-frontend`

### Goal
Admin Advocacy page feels as finished as homepage `#advocacy` band—not a read-only list behind marketing.

### Tasks
| # | Task | Acceptance |
|---|------|------------|
| C1 | Issue list + bill fields match preview jurisdiction tags | Visual parity with `advocacy-marketing-preview.tsx` |
| C2 | Campaign cards: deadline, target, % bar | Same pattern as PAC preview bars |
| C3 | Hospital participation rollup on KPI strip | Reuse `membership-analytics` engagement breakdown |
| C4 | Link to Engage audience from launched campaign | One-click from advocacy page |
| C5 | Government Affairs persona journey doc | `lib/association/personas.ts` or help copy update |

### Exit criteria
- [x] Admin campaign bars + public link CTAs align with marketing preview pattern
- [x] No invented stats (DB-backed KPIs only)

---

## Sprint D — Membership Scale & Hospital Roster (P2 · AMS)

**Initiative:** `BL-002`, `BL-006` · Triple-initiative “bulk assign”  
**Duration:** 1 sprint  
**Agents:** `quake-os-ams-specialist`, `quake-os-scale`, `quake-os-backend`, `quake-os-frontend`

### Goal
Statewide roster (235+ hospitals) performs in directory; staff can assign members to hospitals without spreadsheet sidecar.

### Tasks
| # | Task | Acceptance |
|---|------|------------|
| D1 | Cursor pagination on `members` list (>500 rows) | `lib/query-limits.ts` respected |
| D2 | Bulk assign UI from facility roster panel | `general-members-by-facility` integration |
| D3 | Performance budget: list &lt;200ms perceived @ 500 rows | `REALIZATION-PLAN` quality row |
| D4 | Tests for pagination + assign action | `requireCapability`, tenant scope |

### Exit criteria
- [x] `MemberDirectoryVirtual` + `getMembers` cursor path (code)
- [x] Bulk assign from facility roster unassigned panel (code)
- [ ] Import + directory drill on 1k-row CSV in staging (human/staging)

---

## Sprint E — Wedge UX & Pilot Readiness (P1 · Product)

**Initiative:** `REALIZATION-PLAN` Block 1–2 · Operator checklist 🟡 rows  
**Duration:** 1 sprint  
**Agents:** `quake-os-ux`, `quake-os-qa`, `quake-os-frontend`, `quake-os-technical-writer`

### Goal
MemberCore + Events wedge passes `UI-QUALITY-BAR.md` and pilot testers can complete wedge without friction list.

### Tasks
| # | Task | Source |
|---|------|--------|
| E1 | Member detail one-screen story (regs, notes, tags) | REALIZATION-PLAN Block 2 |
| E2 | Event publish flow polish | REALIZATION-PLAN UX row |
| E3 | UI-QUALITY-BAR audit: Overview, Members, Events, Member detail, Event form | REALIZATION-PLAN design pass |
| E4 | Mobile/tablet pass: directory + check-in | REALIZATION-PLAN |
| E5 | Force email failure → `/{orgSlug}/exceptions` drill documented | REALIZATION-PLAN exceptions row |
| E6 | 15-min scripted demo script refresh | `REALIZATION-PLAN` go/no-go |

### Exit criteria
- [x] `OPERATOR-CHECKLIST.md` member detail wedge row 🟢
- [x] E3 wedge UI audit → `docs/WEDGE-UI-AUDIT.md` + contrast/mobile fixes
- [x] E4 mobile pass (directory grid + check-in ≥44px)
- [x] E5 exceptions drill → `docs/EXCEPTIONS-DRILL.md` + `PULSE_DRILL_EMAIL_FAIL`
- [x] E6 15-min script → `docs/DEMO-SCRIPT-15MIN.md`
- [x] E2E wedge expanded (`tests/e2e/demo-wedge.spec.ts` — exceptions, events, member summary, mobile)
- [x] Pilot feedback template in `docs/pilot-feedback/TEMPLATE.md`

---

## Sprint F — Analytics, Security & Integration Depth (P3 · Platform)

**Initiative:** `BL-007`, `BL-008`, `BL-005`  
**Duration:** 1 sprint (after B or parallel low-priority)  
**Agents:** `quake-os-analytics`, `quake-os-integrations`, `quake-os-security`

### Tasks
| # | Task | Notes |
|---|------|-------|
| F1 | `pnpm continuity:export` documented in IT handoff for Power BI import | Honest “export ready” label |
| F2 | Semgrep on `app/actions/advocacy.ts` + public advocacy route | `BL-007` |
| F3 | Legislative tracker adapter stub (`INTEGRATION_REGISTRY` planned → adapter_ready) | `BL-005`; no fake bill data |
| F4 | Hospital participation metric on Insights export CSV | Semantic keys stable |

### Exit criteria
- [x] `docs/IT-HANDOFF.md` + `docs/POWER-BI-SEMANTIC-LAYER.md` reference `pnpm continuity:export`
- [x] Legislative adapter stub (`lib/advocacy/legislative-tracker-adapter.ts`)
- [x] Full Semgrep advocacy pass logged in `data/quake-os/waves/2026-06-07-advocacy-semgrep-audit.md`

---

## Recommended execution order

```
Week 1 (parallel)
├── Sprint A (human) ─────────────────────────────► pilot unblock
└── Sprint B (eng)   ─────────────────────────────► advocacy MVP

Week 2
├── Sprint C (advocacy admin parity)
├── Sprint D (membership scale)
└── Sprint A tail (Stripe + import dry-run)

Week 3
├── Sprint E (wedge UX + pilot scripts)
└── Sprint F start (security/export)

Week 4
├── Sprint F complete
├── Pilot testers (3–5) per REALIZATION-PLAN
└── CEO re-review: flip public claims only if gates pass
```

---

## Explicitly out of scope (cancelled / deferred)

| Item | Reason |
|------|--------|
| Committee roster workflow | Cancelled by product owner this session |
| Staff access admin settings | Cancelled by product owner this session |
| Power BI embed | Roadmap — CSV export only (`PRODUCT-CLAIMS`) |
| Full member B2C SSO | Roadmap |
| Automated renewals marketing | Cron gated; claims forbid Live until Commerce GA |

---

## Gates (every sprint)

```bash
pnpm typecheck
pnpm test
pnpm claims:validate
pnpm leak:checks
# After advocacy/public routes:
pnpm exec semgrep scan --config auto  # or project config
```

---

## Orchestrator kickoff prompts (copy/paste)

**Sprint A**
```
@quake-os-coo Run Phase 1–6 for Sprint A (Pilot Ops Gate). Human tasks from PILOT-EXECUTION-STATUS. Output: dated checklist + blockers.
```

**Sprint B**
```
@quake-os-orchestrator Run Phase 1–6 for Advocacy Take-Action MVP (BL-001). Public form + response capture. Security + tenant. No invented stats.
```

**Sprint D**
```
@quake-os-ams-specialist + @quake-os-scale Run Phase 1–3 for membership pagination + bulk hospital assign (BL-002, BL-006).
```

---

## Success metric (6-week horizon)

| KPI | Today | Target |
|-----|-------|--------|
| Pilot readiness (engineering) | ~85% | 95% |
| Pilot readiness (ops) | ~35% | 90% after Sprint A |
| Advocacy measurable participation | Staff `+1` only | Public form + DB counter |
| Marketing ↔ admin gap (Advocacy) | High | Low after B+C |
| Open backlog P0/P1 (engineering) | 0 | 0 |
| Open backlog P0 (human BL-003) | 1 | 0 after Sprint A |
