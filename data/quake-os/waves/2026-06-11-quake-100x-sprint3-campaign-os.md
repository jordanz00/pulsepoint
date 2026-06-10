# Wave — Quake 100× Sprint 3 (Campaign operating system)

**Date:** 2026-06-11  
**Scope:** Advocacy campaign lifecycle UX  
**Agents:** Product Architect, Healthcare Ops Expert, Frontend Systems

## Shipped

| Item | Path |
|------|------|
| Lifecycle derivation (draft → live → collecting → goal met → paused/closed) | `lib/advocacy-campaign-ops.ts` |
| Campaign board + workflow timeline + ops brief | `components/enterprise/advocacy-campaign-os.tsx` |
| Workflow actions (launch, pause, resume, close, +1) | `components/enterprise/advocacy-campaign-workflow-actions.tsx` |
| Campaign index + detail pages | `app/.../enterprise/advocacy/campaigns/` |
| Pause / resume / close server actions + audit | `app/actions/advocacy.ts` |
| Advocacy hub wired to campaign board | `enterprise/advocacy/page.tsx` |
| Campaign OS CSS | `app/enterprise-foundation.css` |

## Verify

```bash
pnpm exec vitest run tests/unit/advocacy-campaign-ops.test.ts
pnpm exec tsc --noEmit
```

Browse:
- `/demo-healthcare/enterprise/advocacy/campaigns`
- `/demo-healthcare/enterprise/advocacy/campaigns/[id]`

## Next (Sprint 4)

Compliance & MLR presentation — review workflows, approval visibility

**VERDICT:** Sprint 3 core shipped
