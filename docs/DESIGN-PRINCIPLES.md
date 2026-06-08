# Design principles (PulsePoint)

> Authoritative reference for product designers and front-end engineers. Distilled from the **Spark** and **Claude** system prompts and mapped to this codebase.

**Implementation:** `app/globals.css` · `lib/design-tokens.ts` · `components/pulse-fonts.tsx` · `components/ui/help-tip.tsx`

---

## 0. Purpose and scope

One source for philosophy, visual foundations, component patterns, interaction, accessibility, and guidance for data-heavy admin experiences. **Marketing** (`app/(marketing)`) and **admin** (`app/[orgSlug]/(admin)`) share the same token layer; admin may use denser tables where needed.

---

## 1. Core philosophy

| Principle | Practice |
|-----------|----------|
| **Simplicity through reduction** | Strip UI to the minimum viable set, then refine details. One hero, one feature matrix—no duplicate module spotlights on the landing page. |
| **Material honesty** | Frosted glass panels with real depth (blur + highlight edge); restrained ambient motion—never decoration that hurts readability. |
| **Obsessive detail** | Every spacing nudge and motion frame matters; 8pt grid, 44px targets, consistent focus rings. |
| **Coherent design language** | Tokenise colour, type, and spacing (`--size-*`, `--fg-*`, `--bg-*`). Legacy `--pc-*` aliases remain for older components. |
| **Context-driven** | Adapt to locale, device, theme cues; honour `prefers-reduced-motion` and `prefers-color-scheme`. |
| **Accessibility by default** | WCAG AA contrast; keyboard paths first; semantic HTML before ARIA. |
| **Performance and efficiency** | Speed equals usability; transform/opacity motion only; design within sensible paint budgets. |

---

## 2. Foundations

### 2.1 Layout and grid

* Fluid, content-out grids using `minmax()` and `clamp()` (marketing hero stats).
* 8pt base spacing; snap dimensions to 4pt increments for icon/text harmony.
* Content max width: `72rem` (`.mk-container`, `.pc-admin-page`).
* Prefer component-level responsiveness; page breakpoints for shell only.

### 2.2 Sizing and spacing tokens

Defined in `:root` in `app/globals.css`:

```css
--size-0: 2px;
--size-1: 4px;
--size-2: 8px;
--size-3: 12px;
--size-4: 16px;
--size-5: 24px;
--size-6: 32px;
--size-7: 48px;
--size-8: 64px;
--size-9: 128px;
```

Use logical `block` / `inline` properties when adding RTL-sensitive layout.

### 2.3 Colour system

| Token | Role |
|-------|------|
| `--bg-canvas` | Page background |
| `--bg-surface` | Cards, panels |
| `--bg-elevated` | Table headers, secondary bands |
| `--fg-default` | Primary text |
| `--fg-muted` | Secondary text |
| `--fg-subtle` | Tertiary / eyebrows |
| `--border-muted` | Hairlines |
| `--border-strong` | Emphasised borders |
| `--accent-brand` | Sky/cyan (CTA, links) on navy + white |
| `--pc-sidebar-bg` | Dark navy admin navigation |
| `--accent-positive` | Success |
| `--accent-warning` | Caution |
| `--accent-danger` | Errors |

Hover/active on brand: `color-mix(in srgb, var(--accent-brand), black 12%)`.

Dark marketing bands use `--bg-inverse` / `--fg-on-inverse` (fixed contrast; not tied to light-theme fg tokens).

### 2.3a Liquid glass (iOS / Apple-style)

Translucent surfaces blur the **canvas** behind them—used across marketing, admin, forms, and demo.

| Class | Use |
|-------|-----|
| `.pp-canvas` | Page background (soft brand gradients; fixed attachment) |
| `.pc-glass-chrome` | Headers, sidebar, demo banner, walkthrough bar, footer |
| `.pc-glass-panel` | Cards, bento tiles, stat cards, tables, forms, FAQ shell |
| `.pc-glass-subtle` | Inputs, inactive module pills, nested hero cells |
| `.pc-glass-band` | Full-width bands (stats, pricing, vs legacy) |

Recipe: `backdrop-filter: blur(36–44px) saturate(200%)`, ~48–58% white fill, dual **highlight** inset, layered soft shadow. Canvas uses slow **ambient orbs** (`.pp-canvas::before`). Cards lift 3px on hover with `--ease-smooth` (380ms).

**Accessibility:** `@media (prefers-reduced-transparency: reduce)` and no-`backdrop-filter` fallbacks use solid `--bg-surface`. Primary CTAs stay **solid** brand teal for contrast.

### 2.4 Typography

* **Display:** Lexend via `next/font` (`--font-display`)
* **Body:** Inter (`--font-body`)
* Scale (rem): `--text-xs` 0.75 · `--text-sm` 0.875 · `--text-base` 1 · `--text-lg` 1.25 · `--text-xl` 1.5 · `--text-2xl` 2 · `--text-3xl` 2.5
* Prose max width: `75ch` (`.pc-prose`)
* Marketing and admin headings use `.pc-display` / Lexend

### 2.5 Iconography

* Prefer 24×24 SVG with `currentColor` for theming.
* Avoid fills under 2px interior spacing.

### 2.6 Elevation and layers

| Tier | z-index token | Shadow |
|------|---------------|--------|
| Base | 0–99 | none |
| Sticky header / demo banner | `--z-header` (100) | `--shadow-base` |
| Dropdown / tooltips | `--z-dropdown` (600) | `--shadow-dropdown` |
| Modal | `--z-modal` (800) | `--shadow-modal` |
| Overlay | `--z-overlay` (999) | backdrop + tint |

---

## 3. Patterns and components

### 3.1 Atoms

* **Button** — `.pc-btn-primary` / `.pc-btn-secondary`; `min-height: 44px`; `:focus-visible` ring (`--focus-ring`, 2px offset).
* **Input** — visible label; paired help text; validation messages with `aria-live="polite"` when added.
* **Status pill** — `.mk-status-live` / `.mk-status-alpha` (UI label: **Preview**) / `.mk-status-roadmap`
* **Link** — `.pc-link`
* **Help tip** — `HelpTip` + `.pc-help-tip-*`; plain English; no doc links in UI

### 3.2 Molecules

* **Form field** — label + control + help + error
* **Card** — `.pc-card` / `.mk-bento-card`
* **Tooltip** — hover on fine pointers; focus and tap on touch; **Escape** dismisses

### 3.3 Organisms

* **NavBar** — `.mk-glass-header` on marketing; collapses via responsive layout
* **Landing page** — Hero, stats, pricing value, feature matrix, module showcase, personas, vs legacy, security, FAQ, demo CTA
* **Dashboard** — `AppShell` sidebar, overview stat grid, product suite grid
* **Data table** — `.pc-table`; virtual scrolling on roadmap for large datasets

### 3.4 Templates

| Template | Entry |
|----------|--------|
| Landing | `app/(marketing)/page.tsx` |
| Demo entry | `app/demo/page.tsx` |
| Admin home | `app/[orgSlug]/(admin)/page.tsx` |

---

## 4. Interaction and motion

### 4.1 Feedback states

* `:hover` for affordance on `hover: hover` devices only where sticky tooltips would annoy touch users.
* `:focus-visible` — brand ring, 2px offset.
* `:active` — `scale(0.98)` on primary/secondary buttons.

### 4.2 Motion tokens

| Token | Value |
|-------|--------|
| `--motion-fast` | 150ms |
| `--motion-medium` | 250ms |
| `--motion-slow` | 400ms |
| `--ease-out` | entry |
| `--ease-in` | exit |

Prefer `transform` and `opacity`; avoid animating `top` / `left`.

### 4.3 Accessible motion

```css
@media (prefers-reduced-motion: reduce) {
  /* durations → 0.01ms; disable hero fade and demo pulse */
}
```

---

## 5. Accessibility and inclusive design

1. **Semantic HTML first**; ARIA when structure is insufficient.
2. **Keyboard paths** — tab order follows DOM; **Skip to main** on marketing and admin (`SkipToMain` → `#main-content`).
3. **Contrast** — ≥ 4.5:1 body text on `--bg-canvas` / `--bg-surface`.
4. **Readable copy** — 8th–10th grade on marketing and in-app help (`lib/help-copy.ts`).
5. **Forms** — inline validation; announce errors politely when implemented.
6. **I18n-ready tokens** — semantic names, not language embedded in token keys.

### PulsePoint checklist

- [x] Skip to main on marketing
- [x] Skip to main on admin shell
- [x] Focus visible on buttons
- [x] Help tips: keyboard + Escape
- [x] Status pills include text (not colour alone)
- [x] Reduced motion respected
- [x] FAQ accordion: `aria-expanded`, `aria-controls`, Arrow/Home/End keyboard nav
- [x] Form field molecule: `FormField` + `FormAlert` + `lib/form-help-copy.ts` on member/event/registration/portal forms
- [ ] Data tables: keyboard column navigation (roadmap)

---

## 6. Complex and data-heavy experiences

* Admin tables: prefer pagination or virtual scroll before rendering 10k rows.
* Maps/charts (future): failure isolation—widgets must not break print or core nav.
* Keep client work in `requestAnimationFrame` batches when adding scroll handlers.

---

## 7. Marketing honesty (product-specific)

Do not violate design trust with fake social proof. No invented review badges or member counts on the landing page. Use **Live / Preview / Coming soon** per `docs/PRODUCT-CLAIMS.md`. No `.md` or internal doc paths in user-facing marketing or demo copy.

---

## 8. Related docs

* `docs/UI-QUALITY-BAR.md` — admin UI gates
* `docs/PRODUCT-CLAIMS.md` — claim registry
* `docs/DEMO-GUIDE.md` — walkthrough
