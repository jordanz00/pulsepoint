# Quake OS Wave — Membership Core · Advocacy · Pilot Hardening

**Date:** 2026-06-05  
**Orchestrator:** quake-os-orchestrator  
**Initiatives:** EPIC-MEMBERSHIP-CORE · EPIC-ADVOCACY-PAC · Pilot hardening  
**Repo:** `/Users/jordanzabady/Desktop/pulse`

---

## Phase 1 — Research (parallel)

### market-research
- **Finding:** Protech remains primary wedge; PulsePoint wins on modern UX, honest pilot scope, Microsoft path.
- **Gap:** Advocacy/PAC marketing ahead of admin product — classic legacy AMS pattern inverted (we lead visual, trail workflow depth).
- **Sources:** `data/quake-os/competitive-intel.json`, `docs/PROTECH-FEATURE-MAP.md`

### hospital-association
- **Finding:** MemberCore directory + governance roles are pilot-ready for statewide roster; renewals and hospital-account assignment split across MemberCore vs Enterprise orgs.
- **Risk:** Policy staff landing on read-only Advocacy page — persona mismatch (`lib/association/personas.ts`).
- **Sources:** `app/[orgSlug]/(admin)/members/page.tsx`, `enterprise/organizations/page.tsx`

### healthcare-association
- **Finding:** CE/Learn alpha; membership analytics uses real tenant KPIs — good board surface.
- **Gap:** No certification program depth vs iMIS.
- **Sources:** `members/analytics/page.tsx`, `lib/membership-analytics.ts`

### health-system-ops
- **Finding:** `MemberOrganization` hierarchy supports multi-hospital; enterprise hub is the admin path for accounts.
- **Gap:** Bulk member→hospital assignment not in MemberCore day flow.
- **Sources:** `prisma/schema.prisma`, `lib/general-members-by-facility.ts`

### nonprofit
- **Finding:** Giving alpha covers generic donations; PAC is marketing-only — acceptable if labeled preview.
- **Sources:** `lib/pac-marketing-preview.ts`, `giving/page.tsx`

---

## Phase 2 — Planning (parallel)

### product-manager
| Priority | Epic | Sprint goal | Acceptance |
|----------|------|-------------|------------|
| **P0** | Pilot hardening | Staging + Entra + owners + smoke pass | Day-30 checklist ✅ |
| **P1** | Membership Core | Protech import on staging + badge/claims parity | `PRODUCT-CLAIMS.md` = UI badges |
| **P2** | Advocacy | Issue→Campaign→Engage loop (MVP) | Staff can launch audience from campaign |
| **P3** | Advocacy UX | Admin parity with marketing showcase | `PageHeader` alpha + glass KPIs + CTAs |

### solution-architect
- Advocacy loop: `AdvocacyCampaign` → Engage audience segment → `EmailSendLog` → response counter on campaign (extend schema lightly).
- Renewal cron: gate `platform-cron.ts` renewal/subscription jobs behind org feature flag until Stripe drill passes.
- **Sources:** `docs/ENTERPRISE-ARCHITECTURE.md`, `lib/jobs/platform-cron.ts`

### ux + customer-journey
- Member engagement dashboard: liquid glass tier viz shipped (replaces broken ring chart).
- Advocacy admin: add empty-state CTAs, campaign progress bars mirroring `advocacy-marketing-preview.tsx`.
- Journey gap: Government Affairs persona needs **launch campaign** not just view lists.

### revenue
- Dues renewal automation stays **roadmap** until Stripe drill + Commerce alpha GA — do not market automated renewals as Live.

---

## Phase 3 — Build (this wave)

| Item | Status | Files |
|------|--------|-------|
| Claims registry: Advocacy + PAC + MemberPulse | ✅ Shipped | `docs/PRODUCT-CLAIMS.md`, `lib/platform-capabilities.ts` |
| Marketing honesty: bill tracking copy | ✅ Shipped | `lib/marketing-home.ts` |
| Advocacy homepage showcase (flagship band) | ✅ Shipped | `advocacy-showcase-section.tsx`, `advocacy-marketing-preview.tsx`, `ADVOCACY_MARKETING` outcomes + alpha proof strip |
| Hospital PAC homepage showcase (flagship band) | ✅ Shipped | `pac-showcase-section.tsx`, `pac-marketing-preview.tsx`, `PAC_MARKETING` plain-language + political focus modes |
| Enterprise integrations (IT / webmaster band) | ✅ Shipped | `enterprise-integrations-showcase-section.tsx` — merged stack + integrations; honest Pilot/Export/Live labels |
| Badge drift: imports, pulse, advocacy | ✅ Shipped | `members/imports`, `members/pulse`, `enterprise/advocacy` |
| Engagement glass viz (no pie) | ✅ Shipped (prior) | `engagement-tier-viz.tsx`, `engagement-metrics-client.tsx` |
| Leak checks 10/10 | ✅ Green | `scripts/ten-member-leak-checks.sh` |
| Advocacy take-action loop | ⏳ Next sprint | new actions + Engage wire-up |
| Protech import doc refresh | ⏳ Next sprint | `docs/PROTECH-IMPORT.md` |
| Staging deploy | ⏳ Human/IT | `docs/STAGING-LAUNCH.md` |

---

## Phase 4 — Audit

```
✔ tenant: leak:checks 10/10; getOrgDb on member surfaces
✔ claims: claims:validate pass; Advocacy registered; badges aligned on imports/pulse/advocacy
✔ security: export/import ADMIN-gated; no secrets in wave diffs
✔ membership: directory + analytics + facility roster — Live wedge holds
⚠ advocacy: homepage showcase upgraded (outcomes + focus preview); admin still trails marketing — take-action loop not built; alpha labels on band + preview
⚠ pilot: staging, Entra users, Stripe drill, named owners, privacy counsel — all human ☐
⚠ renewals: cron code exists; claims forbid automated renewals as Live — feature-flag gate recommended
VERDICT: NEEDS REVISION (engineering OK for demo wedge; pilot ops + Advocacy depth before external GA pitch)
Sources: docs/PRODUCT-CLAIMS.md, docs/PILOT-EXECUTION-STATUS.md, pnpm test (84 pass), pnpm leak:checks, pnpm claims:validate
```

### healthcare-compliance
- Member PII paths tenant-scoped; no PHI in Advocacy models. Privacy policy counsel still 🔴 before production pilot.

### risk
- **Medium:** Showcase-to-product gap on Advocacy if pitch leads with policy module.
- **Low:** Tenant isolation — automated gates green.

### qa
- `pnpm test` — 84 passed
- `pnpm claims:validate` — OK
- `pnpm leak:checks` — 10/10
- E2E — demo wedge only; does not cover Entra/Stripe staging path

---

## Phase 5 — Optimize

### analytics
- Ship hospital participation rollup on Advocacy KPI strip (reuse `membership-analytics` engagement breakdown patterns).

### membership-growth
- Surface at-risk panel + renewal due 30 on demo home — already on CEO dashboard; link to Engage sequences.

### innovation
- Executive copilot brief should cite honest Advocacy alpha scope until campaign loop ships.

### technical-writer
- Refresh `PROTECH-IMPORT.md` to match `lib/member-import-csv.ts` columns (tier, renewal, org).
- Resolve `pilot-healthcare` vs `demo-healthcare` slug in `STAGING-LAUNCH.md` + `ENTRA-PILOT-SETUP.md`.

---

## Phase 6 — Executive

### CEO Decision: **REVISE** (demo wedge SHIP; full pilot DEFER 2–3 weeks)

**Rationale:** MemberCore + Events honest Live path is strong for local/demo pitch. External pilot with Entra + money path blocked on human gates. Advocacy must not lead grant deck until take-action MVP.

### COO — Next sprint assignments

| Owner agent | Assignment | Due |
|-------------|------------|-----|
| quake-os-coo + human IT | Staging deploy + 3–5 Entra users | Week 1 |
| quake-os-integrations + Finance | Stripe pilot drill on staging | Week 1 |
| quake-os-product-manager | Advocacy campaign→Engage MVP spec | Week 2 |
| quake-os-frontend | Advocacy admin glass parity pass | Week 2 |
| quake-os-technical-writer | PROTECH-IMPORT + slug doc alignment | Week 1 |
| Leadership (human) | Named owners in PILOT-PLAYBOOK | Week 1 |

### CTO — Architecture note
Gate `renewal-sweep` / `subscription-billing` in `platform-cron.ts` behind org config until Commerce + Stripe drill complete. Advocacy response capture needs schema addition before Engage wire-up.

### KPIs impacted
- Member retention outreach (at-risk count visible — ✅)
- Advocacy campaign participation (not measurable until Phase 2 build — ❌)
- Pilot readiness score (engineering 85% / ops 35% — ⚠)

---

## Wave artifacts updated

- `docs/PRODUCT-CLAIMS.md`
- `lib/platform-capabilities.ts`
- `lib/marketing-home.ts`
- Badge fixes on imports, pulse, advocacy pages
- `data/quake-os/requirements-registry.json` (status bump)
- `data/quake-os/lessons-learned.md`
