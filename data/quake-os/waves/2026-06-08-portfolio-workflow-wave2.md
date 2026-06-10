# Quake OS Wave — Portfolio Workflow Wave 2

**Date:** 2026-06-08  
**Workflow:** `docs/QUAKE-OS-PORTFOLIO-WORKFLOW.md`  
**Verdict:** SHIP

## Phase 3 build

| Item | Files |
|------|--------|
| Why PulsePoint layout fix | `vs-legacy-premium.tsx`, `marketing-showcases.css`, `why-pulsepoint-flagship.css` |
| Recharts container guard | `use-chart-container-ready.ts`, `glass-area-chart.tsx`, `glass-donut-chart.tsx`, `pulse-surfaces.css` |
| Jump nav portfolio links | `marketing-jump-nav.tsx` — Workforce + vs Protech |
| Backlog closure | `BL-036`, `BL-037` in `improvement-backlog.json` |
| E2E | `marketing.spec.ts` — chapter pills + compare-protech public |
| Backlog | `BL-039` — layout + chart polish |

## Checklist status

| # | Gate | Status |
|---|------|--------|
| 1 | Public routes (compare, whats-new, advocacy issue) | ✔ |
| 2 | Walkthrough 19 steps + ★ portfolio highlights | ✔ |
| 3 | Board pack HTML + unit test | ✔ |
| 4 | Command center + learn workforce demo-first | ✔ |
| 5 | Marketing nav + learn section on `/` | ✔ |
| 6 | Why PulsePoint typography (no overlap) | ✔ |

## Verify

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm quake:gates
pnpm dev
# /  /compare-protech  /#why-pulsepoint
# DEMO_MODE=true: pnpm test:e2e tests/e2e/marketing.spec.ts
```

## Next (human-only)

- **BL-003** staging pilot (Entra, Stripe, owners)
- Replace illustrative YouTube embeds with association-hosted video
- SME sign-off on advocacy template copy
