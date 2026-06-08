# PulsePoint — UI quality bar (enforceable)

**Audience:** Anyone shipping admin or marketing UI  
**Purpose:** Turn “Apple-influenced clarity” from aspiration into **reviewable rules** so screens built six months apart still feel native.  
**Sources of truth:** `app/globals.css` (`--pc-*`), `lib/design-tokens.ts`, shared components in `components/ui/`.

PRs that add or materially change admin surfaces should self-check against this doc. Design audits in [REALIZATION-PLAN.md](./REALIZATION-PLAN.md) use it as the rubric.

---

## Layout

| Rule | Standard |
|------|----------|
| **Content width** | Admin page content uses `.pc-admin-page` (`max-w-6xl`) or equivalent; no full-bleed text columns on desktop |
| **Page rhythm** | `space-y-8` between major sections; `space-y-4` inside sections |
| **Cards** | Use `.pc-card` or `.pc-stat-card`; padding `p-5`–`p-6`; consistent `rounded-2xl` |
| **Stat rows** | Use `.pc-stat-grid` only—never inline stat links without a grid parent |
| **Primary CTA** | **One** primary action per surface (e.g. “Add member” on directory); secondary actions use `.pc-btn-secondary` |
| **Tables** | Wrap in `.pc-table-wrap`; never bare `<table>` on white background without wrapper |
| **Sidebar + main** | Main column has `min-w-0` and `overflow-x-hidden` so content does not underlap sidebar |

---

## Typography

| Rule | Standard |
|------|----------|
| **Scales** | Page title: `text-2xl font-bold` via `PageHeader`. Section title: `text-lg font-semibold`. Body: `text-sm`. Meta/labels: `text-xs` uppercase tracking for table headers only |
| **No arbitrary sizes** | Avoid one-off `text-[13px]`, `text-[22px]`, etc. in admin—use the scale above |
| **Hierarchy** | One `h1` per page (`PageHeader`). Sections use `h2`. Card titles use `h3` |
| **Display font** | Large numbers (KPIs) may use `--pc-font-display` via `.pc-stat-value` |
| **Truncation** | Long labels in narrow cells: `truncate` or `line-clamp-*` with `min-w-0` on flex children |
| **Marketing ↔ admin** | Marketing may be more expressive; **colors and navy text** must match admin tokens |

---

## Color

| Rule | Standard |
|------|----------|
| **Tokens only** | Use `var(--pc-*)` or Tailwind mapped to design tokens—**no arbitrary hex** in admin (`#334455`, etc.) |
| **Brand** | Primary actions and links: `--pc-brand` / `--pc-brand-hover` |
| **Status** | Success/warning/error: `--pc-success`, `--pc-warning`, `--pc-error` only |
| **Module badges** | Live / Alpha / Roadmap via `Badge` variants—do not invent new pill colors per screen |
| **Backgrounds** | Page: `--bg-canvas`. Cards: `--bg-surface`. Admin sidebar: `--pc-sidebar-bg` (navy). Subtle bands: `--bg-elevated` or `--accent-brand-soft` |
| **Inverse / dark bands** | On `.pp-executive-strip` or `.pp-on-inverse` (navy gradient), use `.pp-executive-strip-title`, `.pp-executive-strip-footnote`, or `--pp-inverse-fg` / `--pp-inverse-muted`—**never** `text-[var(--pc-text)]` or `--fg-default` (same hex as the background → invisible copy) |
| **Two surfaces (never mix)** | **Dark canvas** (admin `main`, frosted `.pc-card`, `.glass` on navy gradient): copy = `--fg-default` / `--glass-fg` (**light** #f8fafc). **Light inset** (white/tint tiles): copy = `--readable-on-light-fg` (**dark** #0b1220). Wrong pairing = invisible UI (dark-on-dark or white-on-white). |
| **Light inset panels** | Backgrounds use `--readable-on-light-bg*` (not `--glass-bg-panel` in dark OS). Markup: `.pp-readable-on-light` and/or `mc-hub`, `ec-hub`, `ec-panel`, `mc-toolbar`. Do **not** set `color-scheme: light` on all of `main`—that forced dark text on the dark canvas. |
| **Tabs on dark canvas** | EventCore tab strip (`.ec-tab` on `main`) uses `--fg-muted`, not `--readable-on-light-muted`. |
| **Visual tone** | Apple-influenced liquid glass: shared ambient canvas, frosted panels, frosted navy sidebar, sky/cyan accent—readable opacity on easy-admin screens |

---

## Interaction

| Rule | Standard |
|------|----------|
| **Destructive actions** | Delete, bulk remove, irreversible import apply → confirm dialog or explicit two-step pattern |
| **Loading** | Lists and detail pages: skeleton or explicit “Loading…”—no blank flash then pop-in |
| **Empty states** | Icon or short headline + one sentence + **primary CTA** (link or button) |
| **Errors** | Inline under field for forms; banner or toast for page-level—**never** raw stack traces |
| **Touch targets** | Buttons and nav links ≥ 44px height where practical (`.pc-btn-primary` already `min-h-11`) |
| **Motion** | Hover: shadow/border only. Respect `prefers-reduced-motion: reduce`—no required animation for comprehension |
| **Links in cards** | Stat and module cards: `display: block`, `min-w-0`, `no-underline` on card root |

---

## Forms

| Rule | Standard |
|------|----------|
| **Labels** | Visible `<label>` or `aria-label`—no placeholder-only labels |
| **Errors** | Show next to field; include what to fix, not error codes |
| **Save behavior** | Primary submit at bottom or sticky footer; consistent “Save” / “Create” wording per entity |
| **Required fields** | Mark required; validate on server; mirror messages in UI |
| **Grids** | Two-column field groups: `grid gap-4 sm:grid-cols-2` at form level—not per-field hacks |

---

## Tables & lists

| Rule | Standard |
|------|----------|
| **Filters** | Top-aligned above table; filters do not overlap table header on mobile (stack with `flex-wrap`) |
| **Density** | Default row padding from `.pc-table td` (`py-3`); do not cram below without explicit “compact” variant |
| **Bulk actions** | If present: left of table or dedicated bar; predictable label (“Export CSV”, not “Download”) |
| **Export location** | Member/event exports: ADMIN-gated action on list or detail—documented in runbook; same label everywhere |
| **Row actions** | Prefer link to detail over five icon buttons per row in v1 |

---

## Module surfaces (Live vs Alpha)

| Rule | Standard |
|------|----------|
| **Header** | Every module route uses `PageHeader` with correct `badge` (`live` / `alpha` / `roadmap`) |
| **Alpha honesty** | Alpha modules show roadmap chips on unshipped sub-features—no fake “complete” workflows |
| **Coming soon** | Stub pages use `ProductComingSoon` pattern—no half-built grids that look Live |

---

## Review checklist (copy into PR description)

```
UI quality bar:
- [ ] Tokens only (no arbitrary hex in admin)
- [ ] PageHeader + one primary CTA
- [ ] Empty state with CTA (if list)
- [ ] Tables in .pc-table-wrap
- [ ] Destructive action confirmed
- [ ] min-w-0 on grid/flex children that truncate
- [ ] Live/Alpha/Roadmap badge correct for module
- [ ] Contrast: dark canvas = light text; light inset = dark text (no dark-on-dark)
```

---

## Related

| Doc | Role |
|-----|------|
| [REALIZATION-PLAN.md](./REALIZATION-PLAN.md) | When to enforce (Block 1 design pass, module GA) |
| [GO-TO-MARKET-6MONTH.md](./GO-TO-MARKET-6MONTH.md) | &lt;3 clicks narrative |
| [PRODUCT-CLAIMS.md](./PRODUCT-CLAIMS.md) | What modules may claim Live |

**Last updated:** May 2026
