# Quake OS — Sprint L (export parity + portal security tests)

**Date:** 2026-06-08  
**Follows:** Sprint K (`2026-06-08-sprint-k-wave.md`)  
**Workflow:** Pick → Build → Gates → Execute → Wave → Demo

---

## Shipped

| ID | Item | Artifact |
|----|------|----------|
| BL-040 | Giving campaign detail export parity (DB) | `paidGiftExportRows`, `tests/integration/giving-campaign-export-parity.test.ts` |
| BL-041 | Portal transcript export unit tests | `tests/unit/portal-transcript-export.test.ts` |

---

## Demo script (60 seconds)

1. **`/demo-healthcare/giving/{campaign}`** — raised total matches paid gifts list  
2. **`/demo-healthcare/portal`** → **Download my CE transcript** (member self-service)  
3. **`pnpm test`** — giving parity + portal transcript tests green  

---

## Gates

```bash
pnpm quake:execute 2026-06-08-sprint-l
```

---

## Sprint M — candidates

1. Communities post form on admin space detail  
2. Giving campaign-scoped CSV export action  
3. Learn supportability sign-off rows in `SUPPORTABILITY-GATES.md`  
4. BL-003 staging pilot — human operator
