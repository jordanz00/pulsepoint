# Quake OS — Sprint M (communities post + campaign export + automation fix)

**Date:** 2026-06-08  
**Follows:** Sprint L (`2026-06-08-sprint-l-wave.md`)

---

## Shipped

| ID | Item | Artifact |
|----|------|----------|
| BL-042 | Communities post form | `community-post-form.tsx`, `createCommunityPost` audit |
| BL-043 | Campaign-scoped CSV export | `exportDonorsCsv(orgSlug, campaignId)`, campaign detail button |
| BL-044 | Learn supportability rows | `docs/SUPPORTABILITY-GATES.md` transcript checks |
| BL-045 | Automation gate timeout | `quake-os/core/gate-runner.ts` 300s timeout |

## Marketing (session)

- Act I compare: static table (scrubber removed)
- Hero H1: **PulsePoint** + `metaTitle` for tab/OG

---

## Open (human only)

| ID | Item |
|----|------|
| BL-003 | Staging pilot — Entra + Stripe + owners (`docs/SPRINT-A-OPERATOR-PACKET.md`) |

---

## Gates

```bash
pnpm quake:gates
pnpm quake:automation:run
```
