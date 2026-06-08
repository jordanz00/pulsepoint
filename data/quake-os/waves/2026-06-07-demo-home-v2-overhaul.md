# Quake OS Wave — Demo Home Executive Overhaul (v2)

**Date:** 2026-06-07  
**Route:** `/demo-healthcare` (easy-admin home)  
**Verdict:** SHIP

## Problem

Demo home stacked 15+ sections with repeated KPIs (financial overview + briefing snapshot + membership grid), empty hero glass, color key legend, duplicate activity feeds, 11 module tiles + suite strip + export section — ~3 screens of noise for CEOs.

## Solution — information architecture

| Zone | Content |
|------|---------|
| **Welcome hero** | Org name, Live badge, CTAs, data-as-of, **3 KPIs only** (revenue, members, non-dues) |
| **Bento** | Executive briefing (home variant) + compact revenue panel |
| **Engagement** | Single tier/score block + link to analytics |
| **Footer band** | Upcoming events (2 max) + inline export |
| **Modules** | 6 primary tiles + “All modules” |

## Removed (deduped)

- Color key legend
- Empty decorative hero after PageHeader
- Separate “Financial overview” KPI strip
- “Membership health” 5-stat grid
- “Programs & activity” + full GlassActivityFeed
- Full-width revenue bars + duplicate donut section
- 11-tile action grid + DemoSuiteStrip

## Files changed

- `components/admin/demo-home-dashboard.tsx` — v2 layout
- `components/copilot/executive-briefing.tsx` — `variant="home"` hides snapshot KPIs
- `components/admin/executive-kpi-strip.tsx` — `includeIds` filter
- `components/admin/demo-quick-exports.tsx` — `variant="inline"`
- `lib/copilot/executive-brief.ts` — filter DemoSession audit noise
- `app/liquid-glass-overhaul.css` — `.pp-demo-home--v2` system

## Verify

```bash
cd /Users/jordanzabady/Desktop/pulse && pnpm dev
# Open /demo-healthcare
pnpm quake:gates
```
