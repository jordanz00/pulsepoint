# Quake OS Wave — Leadership Loop + Ship Workflow

**Date:** 2026-06-08  
**Theme:** Stakeholder-visible executive briefing — not script output

---

## Shipped

| ID | Item | Stakeholder sees |
|----|------|------------------|
| BL-032 | **Leadership Loop** page | `/demo-healthcare/leadership` — 6 cards, live stats, guided links |
| BL-033 | **Mission Control** in-app | `/demo-healthcare/mission-control` — Quake telemetry + ship phases |
| BL-034 | Command center integration | Leadership panel on command center + primary CTA on demo home |
| BL-035 | **Quake Ship Workflow** doc | `docs/QUAKE-SHIP-WORKFLOW.md` — build → gates → demo → ship |
| BL-028–031 | Sprint J (prior) | CE transcript, renewals pulse, export parity tests |

---

## 90-second demo script

1. Open **`/demo`** → enter demo → click **Leadership briefing**
2. Walk the **six cards** — point at live stat on each (members, advocacy, courses, renewals, revenue)
3. Click **Membership health** → analytics tiers
4. Click **Board pack** → Print / PDF
5. Show **Mission control** — backlog done count, recent waves, ship workflow

---

## Gates

```bash
pnpm quake:gates
```

**Audit:** APPROVED after gates green

---

## Next (Sprint K)

1. Member portal self-service CE transcript
2. Leadership loop embedded in board-pack PDF cover
3. BL-003 staging pilot (human)
