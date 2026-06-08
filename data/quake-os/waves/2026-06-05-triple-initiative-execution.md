# Quake OS Wave — Triple Initiative Execution

**Date:** 2026-06-05  
**Orchestrator:** quake-os-orchestrator  
**Initiatives:** Membership Core audit · Advocacy polish · Pilot leak-check hardening  
**Repo:** `/Users/jordanzabady/Desktop/pulse`

---

## Executive summary

| Initiative | Verdict | Shipped this wave |
|------------|---------|-------------------|
| **Pilot hardening** | 🟡 Ops gates open; engineering green | Cron gates, leak 10/10, slug doc fix, env docs |
| **Membership Core audit** | 🟢 Demo wedge stronger | PROTECH-IMPORT refresh, analytics alpha badge, hospital accounts link |
| **Advocacy polish** | 🟡 Alpha improved; take-action still roadmap | Hospital KPIs, auth gate, glass panels, empty-state CTAs |

**CEO:** SHIP engineering batch. DEFER external pilot until human gates complete.

---

## Initiative 1 — Pilot leak-check hardening

### Phase 1–2
- Leak checks were green; risk was renewal cron firing without Stripe drill.
- Slug drift: `STAGING-LAUNCH.md` vs `ENTRA-PILOT-SETUP.md`.

### Phase 3 — Build ✅
| Change | File |
|--------|------|
| Renewal/subscription cron gated (default off) | `lib/jobs/cron-gates.ts`, `lib/jobs/platform-cron.ts` |
| Env documented | `.env.local.example` |
| Staging slug aligned to seed org | `docs/STAGING-LAUNCH.md` |
| Unit tests | `tests/unit/cron-gates.test.ts` |
| Pilot status updated | `docs/PILOT-EXECUTION-STATUS.md` |

### Phase 4 — Audit
```
✔ leak:checks 10/10
✔ cron: renewal/subscription skipped unless PULSE_CRON_*=true
⚠ human: staging, Entra users, Stripe drill, owners, privacy — still ☐
```

### Phase 5–6
- **COO:** Run Stripe drill → set `PULSE_CRON_RENEWALS=true` on staging only after pass.
- **CTO:** No schema change; env-only gate.

---

## Initiative 2 — Membership Core audit

### Phase 1 findings
- Import supports 10k rows, hospital `organizationName`, tiers, renewal dates — doc said 500/3 columns only.
- Badge drift: analytics claimed live; claims say alpha.
- Hospital accounts buried under Enterprise, not MemberCore header.

### Phase 3 — Build ✅
| Change | File |
|--------|------|
| PROTECH-IMPORT aligned to `member-import-csv.ts` | `docs/PROTECH-IMPORT.md` |
| Analytics badge → alpha | `members/analytics/page.tsx` |
| Hospital accounts CTA on directory | `members/page.tsx` |

### Phase 4 — Audit
```
✔ tenant: getOrgDb + leak checks on all member paths
✔ claims: import/pulse/analytics badges match PRODUCT-CLAIMS
⚠ renewals: workflow alpha; cron gated — honest
⚠ unified bulk assign member→hospital — still roadmap
```

### Phase 5–6
- **P1 next:** Protech dry-run on staging after deploy.
- **P2 next:** Bulk hospital assignment from facility roster panel.

---

## Initiative 3 — Advocacy polish

### Phase 1 findings (hospital-association expert)
- Read-only admin; member count wrong unit for state associations.
- No take-action, no CRUD, showcase >> product.

### Phase 3 — Build ✅
| Change | File |
|--------|------|
| Hospital account + engagement KPIs (real DB) | `lib/advocacy-dashboard.ts`, `enterprise/advocacy/page.tsx` |
| Staff auth gate | `requireOrgAccessForSlug` |
| Glass shell + panel CTAs (Engage, Committees, hospital accounts) | advocacy page + `pulse-surfaces.css` |
| Campaign shows linked issue/bill | advocacy page |

### Phase 4 — Audit
```
✔ data: hospital KPIs from MemberOrganization + engagement tiers — no invented stats
✔ security: requireOrgAccessForSlug on advocacy route
✔ claims: alpha badge + honest subtitle
⚠ take-action launch — not built
⚠ issue/campaign CRUD — not built
⚠ legislative feed — roadmap
```

### Phase 5–6
- **P2 next sprint:** `app/actions/advocacy.ts` + campaign→Engage MVP.
- **Do not** lead pitch with Advocacy until P2 ships.

---

## Gates (post-wave)

```bash
pnpm test          # 86 passed
pnpm claims:validate  # OK
pnpm leak:checks   # 10/10
```

---

## COO — Next sprint (all initiatives)

1. Deploy staging + Entra (`docs/STAGING-LAUNCH.md`)
2. Protech import dry-run (`docs/PROTECH-IMPORT.md`)
3. Stripe drill → enable `PULSE_CRON_RENEWALS` on staging
4. Advocacy take-action MVP spec + build
5. Named owners in `docs/PILOT-PLAYBOOK.md`

---

## Files touched (execution)

- `lib/jobs/cron-gates.ts`, `lib/jobs/platform-cron.ts`
- `lib/advocacy-dashboard.ts`
- `app/[orgSlug]/(admin)/enterprise/advocacy/page.tsx`
- `app/[orgSlug]/(admin)/members/page.tsx`
- `app/[orgSlug]/(admin)/members/analytics/page.tsx`
- `docs/PROTECH-IMPORT.md`, `docs/STAGING-LAUNCH.md`, `docs/PILOT-EXECUTION-STATUS.md`
- `.env.local.example`, `app/pulse-surfaces.css`
- `tests/unit/cron-gates.test.ts`
