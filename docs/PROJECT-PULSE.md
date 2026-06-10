# PROJECT-PULSE — active focus

**Updated:** 2026-06-09  
**Owner:** Jordan Zabady  
**Workflow:** [CURSOR-WORKFLOW.md](./CURSOR-WORKFLOW.md)

---

## This week — ship for demos

| Priority | Outcome | Status |
|----------|---------|--------|
| P0 | Why PulsePoint flagship landing | **Done** — static compare + module film (`why-pulsepoint-flagship.css`) |
| P0 | Cursor workflow system | **Done** — `docs/CURSOR-WORKFLOW.md`, `pnpm workflow:session` |
| P0 | EventCore revenue mix — no clipped labels | **Done** |
| P0 | E2E marketing tests match live copy | **Done** |
| P1 | KCJ proposal HTML + 2-page PDF | **Done** |
| P1 | Git commit pulse changes | **Done** — `8096339` Flagship 5 + `HEAD` Quake corp / enterprise |
| P1 | Quake OS Corporation (7 divisions) | **Done** — `pnpm quake:os:corporation` |
| P1 | Health system governance page | **Done** — `/enterprise/governance` |
| P1 | Corporation GitHub Action + handoff CLI | **Done** — `quake-os-corporation.yml` |
| P1 | Flagship 5 hub + marketing | **Done** — `/flagship`, `#flagship-features`, BL-049 |
| P2 | Cursor Automations saved in UI | Human — run `pnpm quake:automation:install` (4 workflows) |

---

## Do NOT touch this week

- HAP `state-data.js` / 340B print pipeline (separate product)
- Production staging deploy (BL-003 — IT)

---

## Demo URLs (local)

```bash
cd /Users/jordanzabady/Desktop/pulse && pnpm dev
```

| Surface | URL |
|---------|-----|
| Landing | http://localhost:3000/ |
| Why PulsePoint | http://localhost:3000/#why-pulsepoint |
| Healthcare demo | http://localhost:3000/demo-healthcare |
| Command center | http://localhost:3000/demo-healthcare/command-center |
| Mission control (Quake OS) | http://localhost:3000/demo-healthcare/mission-control |
| Health system governance | http://localhost:3000/demo-healthcare/enterprise/governance |
| Flagship 5 hub | http://localhost:3000/demo-healthcare/flagship |
| Flagship walkthrough | http://localhost:3000/demo-healthcare/flagship/walkthrough?step=0 |
| Marketing Flagship | http://localhost:3000/#flagship-features |
| Top 20 showcase | http://localhost:3000/demo-healthcare/showcase |
| EventCore | http://localhost:3000/demo-healthcare/events |

---

## Last gate run

```bash
pnpm quake:gates   # OK as of 2026-06-08
```

---

## Open loops

- [ ] Commit pulse repo when ready
- [ ] Save 4 Cursor automations from `automation-prompts/` (incl. corporation-cycle)
- [ ] BL-003 pilot human checklist
