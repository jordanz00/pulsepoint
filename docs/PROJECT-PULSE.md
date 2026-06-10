# PROJECT-PULSE — active focus

**Updated:** 2026-06-10  
**Owner:** Jordan Zabady  
**Workflow:** [CURSOR-WORKFLOW.md](./CURSOR-WORKFLOW.md)

---

## This week — ship for demos

| Priority | Outcome | Status |
|----------|---------|--------|
| P0 | Why PulsePoint flagship landing | **Done** |
| P0 | Cursor workflow system | **Done** |
| P0 | EventCore revenue mix — no clipped labels | **Done** |
| P0 | E2E marketing + wedge smoke | **Done** |
| P1 | Git commit pulse changes | **Done** — pushed `main` |
| P1 | Quake OS Corporation (7 divisions) | **Done** |
| P1 | Health system governance | **Done** |
| P1 | Flagship 5 hub + marketing | **Done** |
| P2 | Cursor Automations saved in UI | **Human** — `pnpm quake:automation:install` |

---

## Do NOT touch this week

- HAP `state-data.js` / 340B print pipeline (separate product)
- **BL-003** staging pilot (Entra + Stripe) — IT/human only

---

## Demo URLs (local)

```bash
cd /Users/jordanzabady/Desktop/pulse && pnpm dev
```

| Surface | URL |
|---------|-----|
| Landing | http://localhost:3000/ |
| Why PulsePoint | http://localhost:3000/#why-pulsepoint |
| Flagship 5 | http://localhost:3000/#flagship-features |
| Healthcare demo | http://localhost:3000/demo-healthcare |
| Flagship hub | http://localhost:3000/demo-healthcare/flagship |
| Top 20 showcase | http://localhost:3000/demo-healthcare/showcase |
| Command center | http://localhost:3000/demo-healthcare/command-center |
| Mission control | http://localhost:3000/demo-healthcare/mission-control |
| Governance | http://localhost:3000/demo-healthcare/enterprise/governance |

---

## Last gate run

```bash
pnpm quake:gates          # OK 2026-06-10
pnpm test                 # 331 passed
pnpm claims:validate      # OK
pnpm leak:checks          # OK
pnpm exec playwright test # E2E (DEMO_MODE=true)
```

---

## Open loops (human only)

- [ ] Save 4 Cursor automations — `pnpm quake:automation:install` then paste prompts in Cursor UI
- [ ] BL-003 staging pilot — Entra + Stripe + owners (operator packet)
