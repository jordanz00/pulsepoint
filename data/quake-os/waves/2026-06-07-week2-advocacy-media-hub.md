# Quake OS Wave — Week 2 Advocacy Hero Media + Toolkit

**Date:** 2026-06-07  
**Initiative:** Advocacy issue landing with hero media + toolkit downloads  
**Repo:** `/Users/jordanzabady/Desktop/pulse`  
**Demo org:** `demo-healthcare`  
**Label:** Alpha · `contentMeta.validationStatus: illustrative_only`

---

## Shipped

| Surface | Route | Change |
|---------|-------|--------|
| Public issue pages | `/demo-healthcare/advocacy/issues/nursing-workforce` | Hero video + still, toolkit download, take-action CTA |
| Public issue pages | `/demo-healthcare/advocacy/issues/workplace-violence` | Same pattern |
| Issue hub (staff) | `/demo-healthcare/enterprise/advocacy/issues` | Template cards show Hero video / Toolkit badges |
| Command center | `/demo-healthcare/command-center` | Advocacy panel links to public issue pages + issue hub |
| Enterprise HA strip | `/demo-healthcare/enterprise` | Advocacy issues tile → issue hub |
| Engage | `/demo-healthcare/engage` | Seed template: **Issue alert — advocacy topic (alpha)** |
| Toolkits (static) | `/advocacy-toolkits/*.html` | Printable one-pagers (Print → PDF) |

---

## Files touched

- `lib/advocacy/issue-templates.ts` — media + toolkit fields; workplace-violence story copy
- `lib/advocacy/issue-media.ts` — allowlist for toolkit/hero paths
- `components/advocacy/advocacy-issue-hero-media.tsx`
- `components/advocacy/advocacy-issue-public-showcase.tsx`
- `components/advocacy/advocacy-issue-hub.tsx`
- `app/[orgSlug]/advocacy/issues/[slug]/page.tsx` — active campaign + showcase for all templates
- `components/executive/ceo-domain-panels.tsx` — deep links
- `components/enterprise/hospital-association-strip.tsx`
- `public/advocacy-toolkits/` — hero SVGs + HTML toolkits
- `prisma/seed-demo.ts` — ACTIVE issues, take-action campaigns, Engage template
- `docs/PRODUCT-CLAIMS.md`
- `tests/unit/advocacy-issue-media.test.ts`

---

## Gates

```
pnpm typecheck — OK
pnpm test (advocacy-issue-media) — 4 passed
pnpm quake:gates — OK
```

Re-seed demo: `pnpm db:seed:demo`

---

## Audit digest (Phase 4)

```
✔ compliance: illustrative_only disclaimer on public pages; no invented stats; PAC boundary in toolkits
✔ security: toolkit/hero paths allowlisted; video embed YouTube/Vimeo only
✔ tenant: getOrgDb on issue/campaign reads
⚠ sme: policy language still illustrative_only — human SME before leadership demo
VERDICT: APPROVED for alpha demo
Sources: issue-templates.ts; PRODUCT-CLAIMS.md; seed-demo.ts
```

---

## CEO recommendation (Phase 6)

**Decision:** SHIP (alpha demo)

**Next sprint:** Week 3 — virtual career fair booth grid (BL-026)

**Demo routes (10 min script):**

1. `/demo-healthcare/command-center` — advocacy panel → issue pages
2. `/demo-healthcare/enterprise/advocacy/issues` — template media badges
3. `/demo-healthcare/advocacy/issues/nursing-workforce` — hero + toolkit + take action
4. `/demo-healthcare/enterprise/advocacy` — campaign launch
5. `/demo-healthcare/engage` — Issue alert template

---

## Producer checklist (human)

- [ ] Replace demo YouTube URLs with association-branded loop or still
- [ ] SME review summary + toolkit before external use
- [ ] Export final PDF toolkits from approved copy
