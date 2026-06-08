# Quake OS — Sprint G (Post–48h Carryover)

**Date:** 2026-06-08  
**Repo:** `/Users/jordanzabady/Desktop/pulse`  
**Sources:** `2026-06-07-48h-completion-sprint-plan.md`, `OPERATOR-CHECKLIST.md`, `SPRINT-A-OPERATOR-PACKET.md`

## Executive summary

| Track | Owner | Status |
|-------|-------|--------|
| **Sprint A (BL-003)** | Human IT / Finance / Legal | 🔴 Open — blocks production pilot |
| **Sprint G engineering** | Cursor / Quake OS | 🟢 This sprint |
| **AMS roadmap (37 memory tasks)** | Ongoing waves | 🟡 Foundation modules — not 48h blockers |

---

## Sprint A — unchanged (human only)

Complete `docs/SPRINT-A-OPERATOR-PACKET.md` A1–A7 before flipping BL-003 to done.

---

## Sprint G — engineering (1 week)

### P0 — Demo reliability

| ID | Task | Acceptance | Status |
|----|------|------------|--------|
| G1 | Demo DB schema drift guard | `dev-web-safe.sh` + `setup-demo.sh` verify `AdvocacyCampaignResponse` | ✅ Shipped |
| G2 | `pnpm demo:doctor` | One command: schema tables + seed org present | ✅ This wave |
| G3 | Quake memory sync | BL-001–010 memory tasks → `done` | ✅ This wave |

### P1 — 48h carryover (engineering)

| ID | Task | From 48h | Acceptance | Status |
|----|------|----------|------------|--------|
| G4 | Protech 1k stress fixture + script | Sprint D D3 (local) | `tests/fixtures/protech-member-export-1k.csv` + `pnpm import:stress-fixture` | ✅ This wave |
| G5 | Communities doc library seed | Alpha gap | Board + finance spaces show seeded PDF links, not stub | ✅ This wave |
| G6 | Staging preflight script | Sprint A prep | `pnpm staging:preflight` checks env docs | ✅ This wave |
| G7 | Advocacy E2E path | Sprint B tail | Playwright hits public take-action form (demo mode) | Done → Sprint H (BL-015) |

### P2 — Pilot hardening

| ID | Task | Acceptance |
|----|------|------------|
| G8 | Supportability gate doc per alpha module | `docs/SUPPORTABILITY-GATES.md` rows for Commerce, Giving, Engage | Done → Sprint H (BL-016) |
| G9 | Stripe webhook replay helper doc | `docs/STRIPE-PILOT-DRILL.md` § local replay | Done → Sprint H (BL-017) |
| G10 | E2E in CI on every PR | `e2e.yml` required check + README note | Done → Sprint H (BL-018); enable branch protection |

### P3 — Roadmap (not Sprint G)

- Power BI embed · member B2C SSO · legislative vendor feed · FEC/PAC · Ad Ops API (:4000) · GL sync

---

## Recommended order

```
Day 1–2: G1–G6 (demo + import + communities)
Day 3–4: G7–G8 (E2E + supportability)
Parallel: Sprint A human (A1–A7)
Day 5: Gates + BL-003 flip when A complete
```

## Gates

```bash
pnpm demo:doctor
pnpm demo:setup
pnpm test
pnpm claims:validate
pnpm leak:checks
pnpm quake:gates
```

## Success metric

| KPI | Target |
|-----|--------|
| Demo mode error rate | Zero SQLITE missing-table on fresh `demo:setup` |
| 48h engineering backlog | BL-001–010 done; only BL-003 human |
| Pilot readiness (ops) | Sprint A checklist ≥ 5/7 before external users |
