# Quake OS Wave — Portfolio Showcase (Top 10)

**Date:** 2026-06-08  
**Plan:** `docs/PORTFOLIO-SHOWCASE-PLAN.md`  
**Demo org:** Sterling Healthcare Association · `/demo-healthcare`  
**Verdict:** SHIP

## Scope

Ship portfolio-ready surfaces for solo-builder AMS narrative: executive sparklines, board HTML pack, workforce video playlist, advocacy story page, marketing tour CTA — all with honest Live/Alpha labeling.

## Delivered

| # | Feature | Route / wiring |
|---|---------|----------------|
| 1 | Executive home v2 + sparklines | `/demo-healthcare` — hero KPIs with trend sparklines |
| 2 | Executive Briefing | Home bento (existing) |
| 3 | Liquid glass UI | Pass 5 CSS in `liquid-glass-overhaul.css` |
| 4 | Member engagement | Home engagement block (existing) |
| 5 | Membership analytics | `/demo-healthcare/members/analytics` (existing) |
| 6 | Board pack | `/demo-healthcare/insights/board-pack` + Insights CTA |
| 7 | Advocacy nursing workforce | `/demo-healthcare/advocacy/issues/nursing-workforce` |
| 8 | Workforce videos | `/demo-healthcare/learn/workforce` — playlist embed |
| 9 | Member 360° | `/demo-healthcare/members/[id]` (existing) |
| 10 | Protech compare | `/compare-protech` (existing) |

## New / updated files

- `docs/PORTFOLIO-SHOWCASE-PLAN.md`
- `lib/learn/workforce-showcase-videos.ts`
- `components/learn/workforce-video-showcase.tsx`
- `lib/board-pack/build-board-pack-html.ts`
- `components/insights/board-pack-actions.tsx`
- `app/[orgSlug]/(admin)/insights/board-pack/page.tsx`
- `components/advocacy/advocacy-issue-public-showcase.tsx`
- `components/marketing/marketing-hero-tour-video.tsx`
- `lib/advocacy/issue-templates.ts` — story paragraphs + impact bullets (nursing-workforce)
- `app/[orgSlug]/advocacy/issues/[slug]/page.tsx` — showcase layout
- `components/admin/glass-stat-card-live.tsx` — optional sparkline
- `components/admin/executive-kpi-strip.tsx` — `sparklines` prop
- `components/admin/demo-home-dashboard.tsx` — sparklines + portfolio CTAs
- `components/learn/learn-workforce-shell.tsx` — video showcase
- `app/[orgSlug]/(admin)/insights/page.tsx` — Board pack link
- `app/(marketing)/page.tsx` — hero tour section
- `app/liquid-glass-overhaul.css` — Pass 5 showcase styles

## Demo script (15 min)

1. Marketing `/` → hero tour CTA  
2. `/demo-healthcare` → KPIs + briefing + revenue  
3. Members → profile → analytics  
4. Advocacy → nursing workforce  
5. Learn workforce → video playlist  
6. Insights board pack → print/export  
7. Compare Protech → import staging  

## Verify

```bash
cd /Users/jordanzabady/Desktop/pulse && pnpm quake:gates
pnpm dev
# /demo-healthcare
# /demo-healthcare/insights/board-pack
# /demo-healthcare/learn/workforce
# /demo-healthcare/advocacy/issues/nursing-workforce
# /
```

## Honest scope

MemberCore + Events = **Live**. Board pack, workforce videos, advocacy templates = **Alpha / illustrative preview**. YouTube embeds are placeholders until association-hosted video.
