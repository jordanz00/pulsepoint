# Quake Ship Workflow — Sprint K

**Date:** 2026-06-08  
**Workflow:** Pick → Build → Gates → Execute → Wave → Demo

---

## Picked (Phase 1)

| ID | Item |
|----|------|
| BL-037 | Portal self-service CE transcript |
| BL-038 | Board pack leadership loop follow-up |

---

## Shipped (Phase 2)

| Artifact | Route |
|----------|-------|
| `exportPortalTranscriptCsv` | Member action — own record only |
| `PortalTranscriptExportButton` | `/demo-healthcare/portal` → My certifications |
| `BoardPackLeadershipBanner` | `/demo-healthcare/insights/board-pack` |
| `renderBoardPackLeadershipLoopSection` | Included in Download HTML / Print PDF |

---

## 90-second demo script (Phase 5)

1. **Staff:** `/demo-healthcare/members/[id]` → Download CE transcript  
2. **Member:** `/demo-healthcare/portal` → **Download my CE transcript** (same CSV engine)  
3. **Board:** `/demo-healthcare/insights/board-pack` → Leadership loop banner → Print PDF (loop in HTML)  
4. **CEO:** `/demo-healthcare/leadership` → walk six cards  

---

## Gates (Phase 3–4)

```bash
pnpm quake:execute 2026-06-08-sprint-k
```

---

## Human gate (Phase 6)

- **BL-003** — staging pilot (Entra + Stripe): operator packet only
