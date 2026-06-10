# PulsePoint Ad-Ops Glass — Design System

**Status:** Applied in `app/[orgSlug]/(admin)/advertising/ad-ops.css`  
**Canonical repo:** `/Users/jordanzabady/Desktop/pulse`  
**Routes:** `/[orgSlug]/advertising/*` (demo: `/demo-healthcare/advertising`)

Ported from the archived standalone console (`pulsepoint-ams.ARCHIVED-DO-NOT-EDIT`).

---

## 1. Design rationale

Healthcare ad ops teams need software that feels **trustworthy first, beautiful second**. Liquid glass works here because frosted panels create visual hierarchy without heavy chrome — operators scan KPIs, sync errors, and campaign states for hours. The mesh background adds depth but stays muted (brand blue, teal, accent purple at ≤11% opacity) so data remains the focal point. Ad-ops glass is **restrained** compared to marketing: no floating orbs, slower mesh drift, fewer hover lifts. Semantic colors (mint ok, gold warn, rose err) stay saturated on glass pills so sync failures never disappear into aesthetics.

---

## 2. Token reference (scoped under `.ad-ops-shell`)

| Token | Role |
|-------|------|
| `--ad-glass` | Default panel (cards, KPIs, tables) |
| `--ad-glass-strong` | Nav bar, strong surfaces |
| `--ad-glass-muted` | Table headers, subtle fills |
| `--ad-glass-border` | Frost edge highlight |
| `--ad-glass-shadow` | Base elevation + inset top highlight |
| `--ad-glass-shadow-raised` | Hover elevation |
| `--ad-glass-blur` | `blur(20px) saturate(1.28)` |
| `--ad-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` |

Fallback: browsers without `backdrop-filter` get opaque `--ad-glass-strong`.

---

## 3. Page wireframes (text)

### Dashboard (`/advertising`) — 1440×900

```
[Ad-ops subnav glass strip — Dashboard · Campaigns · Sync · Audit · …]
[GlassPageHeader — Healthcare advertising operations]
[ExecutiveKpiStrip — hero KPIs]
[Glass grid — Sync health | Onboarding checklist]
[Recent campaigns table — full width glass panel]
```

### Campaign detail (`/advertising/campaigns/[id]`)

```
Back · state badge
H1 Campaign name · client
[Attention if sync failed]
[Actions: approve · traffic · sync]
Workflow + creatives table
```

### Sync queue (`/advertising/sync`)

```
H1 Sync queue
[Err banner if failures > 0]
[Table: job · campaign · status · error code → runbook]
```

---

## 4. Accessibility checklist

- [x] Body text `--ad-muted` ≥ `#475569` on glass
- [x] `prefers-reduced-motion`: no mesh drift, no hover translate
- [x] Error badges stay high-contrast on glass
- [ ] Command palette (uses main app ⌘K — not ad-ops scoped)

---

## 5. Anti-patterns (avoid)

1. Full-viewport `backdrop-filter` on scroll containers
2. Blur on every table cell
3. Gray-on-glass below 4.5:1 contrast
4. Hiding sync errors for visual calm
5. More than 2 shadow elevations
6. Neon gradients behind dense tables
7. Parallax on ops pages
8. Replacing semantic badges with monochrome glass
9. External CDN fonts in ad-ops module
10. Animating KPI numbers on every poll

---

## 6. Migration phases (archive → pulse)

| Phase | Scope | Status |
|-------|-------|--------|
| A | Tokens + mesh background | Done (`ad-ops.css`) |
| B | Subnav + cards | Done |
| C | Glass panels, tables, badges | Done |
| D | Docs in `docs/ad-ops/` | Done |
| E | Archive duplicate folder | Done — do not edit archive |
