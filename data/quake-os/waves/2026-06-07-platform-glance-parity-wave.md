# Quake OS Wave — Platform Glance Parity (marketing → admin)

**Date:** 2026-06-07  
**ID:** wave-platform-glance-parity-2026-06-07  
**Repo:** `/Users/jordanzabady/Desktop/pulse`  
**Mission:** Admin platform behaves like marketing **At a Glance** — fast, liquid glass, honest Live/Preview labels.

## Verdict

**SHIP (engineering)** — shared briefing component; suite page + demo home wired.

## Problem

Marketing **PulsePoint at a Glance** (`GlanceMarketingPreview`) delivered the desired UX: executive snapshot metrics, layer filters, 12-module grid, detail + chart stage, three lens tabs. Admin used a static 6-tile grid and layered `DemoSuiteExplorer` — slower to scan, visually inconsistent.

## Solution

| Area | Change |
|------|--------|
| **Shared component** | `components/platform/platform-glance-briefing.tsx` — marketing + admin |
| **Config** | `lib/platform-glance.ts` — re-exports glance data + `buildAdminModuleStats()` |
| **Marketing** | `GlanceMarketingPreview` → thin wrapper (`orgSlug="demo-healthcare"`) |
| **Suite page** | `/[orgSlug]/suite` — full briefing + live DB stats; open to all orgs |
| **Demo home** | Platform tab only; live counts; link to full suite |
| **Perf** | `router.prefetch()` on module hover; Link `prefetch` on CTAs |
| **CSS** | `pp-admin-glance-*`, live stat lines in `pulse-surfaces.css` |

## Verify

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm dev
# Demo home: http://localhost:3000/demo-healthcare
# Full suite: http://localhost:3000/demo-healthcare/suite
pnpm test tests/unit/platform-glance.test.ts
pnpm quake:gates
```

## Audit

```
✔ architecture: Single briefing component — marketing/admin parity
✔ compliance: Live stats from DB; preview charts labeled sample
✔ security: No user input in DOM; org-scoped hrefs via productHref
✔ performance: Prefetch on hover; client-only interactivity
⚠ scope: Non-demo orgs get briefing; live stats depend on seed data
VERDICT: APPROVED
Sources: lib/products.ts PULSE_PRODUCTS; lib/glance-marketing-preview.ts
```

## Next

- Command center embed (compact glance strip)
- Sidebar “All modules” → `/suite` for every org
- Replace remaining legacy `ProductSuiteGrid` on non-easy-admin overview
