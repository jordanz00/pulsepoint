# Quake OS — iOS Liquid Glass UI Overhaul

**Date:** 2026-06-07  
**Repo:** `/Users/jordanzabady/Desktop/pulse`  
**Scope:** Site-wide polish — Apple HIG / minimal depth. **Colors unchanged.**

## Shipped

| Layer | File | Change |
|-------|------|--------|
| **Token bridge** | `app/liquid-glass-overhaul.css` | iOS blur, hairline, specular, elevation tokens |
| **Missing primitive** | `.pp-glass-surface` | Backdrop blur + luminance edge (used across admin) |
| **Marketing** | `.mk-liquid-glass`, preview shells | Larger radius, softer shine, hero blur |
| **Module glass** | `.mk-mod-glass-*` | Unified panel/KPI depth |
| **Admin shell** | `.pp-liquid-topbar/sidebar` | Frosted chrome, pill nav |
| **Demo / executive** | demo home, briefing, legend | Hero glass, section rhythm |
| **Components** | stat cards, topic cards, tables, buttons | Hairline borders, inset light |
| **A11y** | `prefers-reduced-motion/transparency` | Safe fallbacks |

## Load order

`globals.css` → `pulse-surfaces.css` → `admin-surfaces.css` → `design-system.css` → **`liquid-glass-overhaul.css`**

## Pass 2 (marketing hero + demo home)

| Surface | Changes |
|---------|---------|
| **Marketing hero** | Softer ambient gradient; frosted pills; stat cards use inset accent not top bar; demo frame double-glass (outer frame + inner preview shell); iOS tab control |
| **Demo home** | Hero `glass pp-glass-surface`; display typography; hairline section accents; revenue bars + mix donut glass; action cards + event rows refined |

Files: `liquid-glass-overhaul.css`, `demo-home-dashboard.tsx`, `marketing-hero-premium.tsx`

## Verify

```bash
pnpm dev
# Marketing `/` — hero headline, stat strip, product preview frame
# Demo `/demo-healthcare` — welcome hero, financial KPIs, revenue mix, action grid
```

## Not changed

- Brand/module color tokens (`--mod-*`, `--brand-*`, topic hues)
- Data, copy, layout structure
