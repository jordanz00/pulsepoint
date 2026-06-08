# Quake OS — Portfolio closure workflow

**Purpose:** Ship demo-ready portfolio surfaces in one session — no partial waves.

## When to run

- Before LinkedIn / board / pilot conversations
- After any portfolio script change in `docs/PORTFOLIO-SHOWCASE-PLAN.md`
- When middleware, walkthrough, or export parity regresses

## Six-phase matrix (one session)

| Phase | Owner | Deliverable |
|-------|--------|-------------|
| 1 Research | `@quake-os-market-research` | Gap list vs Protech + portfolio script |
| 2 Plan | `@quake-os-product-manager` | Top 3 P0/P1 items from backlog or audit |
| 3 Build | `@quake-os-frontend` + `@pulse-glass-ui` | Code + CSS in `/Users/jordanzabady/Desktop/pulse` |
| 4 Audit | `@quake-os-audit` | Middleware, honest claims, no invented KPIs |
| 5 QA | `@quake-os-qa` | `pnpm quake:gates` + E2E smoke |
| 6 Ship | `@quake-os-orchestrator` | Wave report in `data/quake-os/waves/` |

## Mandatory checklist (every closure wave)

```bash
cd /Users/jordanzabady/Desktop/pulse

# 1 — Public routes (demo cookie not required for marketing + advocacy stories)
#    middleware.ts: /compare-protech, /whats-new, /{org}/advocacy/issues/{slug}

# 2 — Walkthrough matches PORTFOLIO-SHOWCASE-PLAN.md (15-min script)
#    lib/demo-walkthrough.ts + components/demo-walkthrough-steps.tsx

# 3 — Board pack HTML parity with on-screen page
#    lib/board-pack/build-board-pack-html.ts + unit test

# 4 — Command center + learn workforce demo-first surfaces

# 5 — Marketing nav: compare, whats-new, learn workforce section on /

pnpm quake:gates
pnpm test tests/e2e/demo-walkthrough.spec.ts   # DEMO_MODE=true
```

## Demo script (verify manually)

1. `/` → hero tour → `/demo` → Guided tour  
2. `/demo-healthcare` → KPIs + briefing  
3. Walkthrough → board pack, workforce, imports steps  
4. `/compare-protech` (no cookie redirect)  
5. `/demo-healthcare/advocacy/issues/nursing-workforce` (public)  
6. Board pack → Print / Save PDF  

## Honest scope

- **Live:** MemberCore, Events, executive home metrics from DB  
- **Alpha:** Board pack export, workforce videos, advocacy templates  
- **Human-only:** Staging pilot (BL-003), SME policy sign-off, replace YouTube embeds  

## Artifacts

| File | Role |
|------|------|
| `docs/PORTFOLIO-SHOWCASE-PLAN.md` | Top 10 features + script |
| `data/quake-os/improvement-backlog.json` | Prioritized work queue |
| `data/quake-os/waves/YYYY-MM-DD-portfolio-closure.md` | Ship evidence |
| `.cursor/rules/quake-os-orchestrator.mdc` | Agent contract |
