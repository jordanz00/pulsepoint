# Quake OS — Sprint H (G+1 pilot hardening)

**Date:** 2026-06-08  
**Follows:** Sprint G (`2026-06-08-sprint-g-plan.md`)  
**Theme:** Advocacy E2E + alpha module supportability + CI contract

---

## Shipped

| ID | Item | Artifact |
|----|------|----------|
| BL-015 / G7 | Advocacy take-action E2E submit | `tests/e2e/advocacy-take-action.spec.ts` |
| BL-016 / G8 | Supportability gates per alpha module | `docs/SUPPORTABILITY-GATES.md` — Commerce, Giving, Engage |
| BL-017 / G9 | Stripe local webhook replay | `docs/STRIPE-PILOT-DRILL.md` § Local replay |
| BL-018 / G10 | E2E required on PRs (docs + workflow name) | `docs/E2E-CI.md`, README, CONTRIBUTING, `e2e.yml` |

---

## Human follow-up

| Item | Owner | Action |
|------|-------|--------|
| BL-003 / Sprint A | IT / Finance / Legal | `docs/SPRINT-A-OPERATOR-PACKET.md` |
| BL-018 branch protection | Repo admin | GitHub → `main` → require **E2E (demo wedge) / playwright** |
| Supportability gate sign-off | Module owners | Flip `[ ]` rows in SUPPORTABILITY-GATES as pilots pass |

---

## Gates (run after merge)

```bash
pnpm demo:doctor
pnpm demo:setup
pnpm test
pnpm test:e2e
pnpm claims:validate
pnpm leak:checks
pnpm quake:gates
```

---

## Next sprint (I) — shipped

See `2026-06-08-sprint-i-wave.md` (BL-019 → BL-024).
