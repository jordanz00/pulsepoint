# PROJECT-PULSE — active focus

**Updated:** 2026-06-08  
**Owner:** Jordan Zabady  
**Workflow:** [CURSOR-WORKFLOW.md](./CURSOR-WORKFLOW.md)

---

## This week — ship for demos

| Priority | Outcome | Status |
|----------|---------|--------|
| P0 | Landing `#why-pulsepoint` flagship + jump nav | **Done** |
| P0 | Cursor workflow system | **Done** — `docs/CURSOR-WORKFLOW.md`, `pnpm workflow:session` |
| P0 | EventCore revenue mix — no clipped labels | **Done** |
| P0 | E2E marketing tests match live copy | **Done** |
| P1 | KCJ proposal HTML + 2-page PDF | **Done** |
| P1 | Git commit pulse changes (681 files) | **Waiting on explicit commit OK** |
| P2 | Cursor Automations saved in UI | Human — run `pnpm quake:automation:install` |

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
| EventCore | http://localhost:3000/demo-healthcare/events |

---

## Last gate run

```bash
pnpm quake:gates   # OK as of 2026-06-08
```

---

## Open loops

- [ ] Commit pulse repo when ready
- [ ] Save 3 Cursor automations from `automation-prompts/`
- [ ] BL-003 pilot human checklist
