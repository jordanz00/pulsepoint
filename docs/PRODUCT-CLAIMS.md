# Product claims registry (marketing vs enforcement)

Marketing copy must match what code and `lib/products.ts` enforce. CI runs `pnpm claims:validate`.

## Live today (`status: "available"`)

| Product ID | Public name | Admin route | Notes |
|------------|-------------|-------------|-------|
| `work` | PulsePoint Work | `/{orgSlug}` admin shell | |
| `members` | MemberCore | `/{orgSlug}/members` | Staff directory, roles, notes — **live**. Enriched 360° timeline and CSV import staging are **demo preview** (see below). |
| `events` | PulsePoint Events | `/{orgSlug}/events` | Paid reg via Stripe when configured — **live**. Speakers/sponsors/sessions + public microsite are **demo preview** on event detail. |

## Alpha today (`status: "alpha"`)

| Product ID | Public name | Admin route | Marketing label |
|------------|-------------|-------------|-----------------|
| `learn` | PulsePoint Learn | `/{orgSlug}/learn` | Roadmap chips on unshipped features. Workforce at `/{orgSlug}/learn/workforce` and public library at `/{orgSlug}/learn/library` — **alpha** (YouTube/Vimeo embeds; CE from watch time = roadmap). |
| `giving` | PulsePoint Giving | `/{orgSlug}/giving` | Roadmap chips on unshipped features |
| `commerce` | PulsePoint Commerce | `/{orgSlug}/commerce` | Admin products/orders — **alpha**. Public store at `/{orgSlug}/store` is **demo preview**. |
| `engage` | PulsePoint Engage | `/{orgSlug}/engage` | Roadmap chips on unshipped features |
| `insights` | PulsePoint Insights | `/{orgSlug}/insights` | KPI board + widget builder — **demo preview**. Manual snapshot today; unattended email schedules not shipped. |
| `advocacy` | PulsePoint Advocacy | `/{orgSlug}/enterprise/advocacy` | Issue/campaign CRUD + take-action audience launch — **alpha**. Issue hub templates + public issue pages at `/advocacy/issues/[slug]` with hero media (YouTube/Vimeo) and printable toolkit downloads — **alpha** (`illustrative_only` until SME). Legislative feed and automated response capture are **roadmap**. |
| `crm` | PulsePoint CRM | `/{orgSlug}/crm` | Workflows, forms, prospector — **alpha**. |

See also `lib/platform-capabilities.ts` for Fonteva-class scope vs Live/Alpha/Demo preview/Roadmap labels.

## Demo preview (Fonteva demo — honest scope)

These surfaces are walkthrough-ready in the Sterling Healthcare demo (`demo-healthcare`). Say **demo preview** or **preview** — not **live automation**.

| Surface | Route | Safe to claim | Do not claim |
|---------|-------|---------------|--------------|
| Member 360° timeline | `/{orgSlug}/members/[id]` | Unified staff view of events, orders, giving, CE, notes | Automated scoring jobs, ML engagement |
| CSV import staging | `/{orgSlug}/members/imports` | Upload, duplicate review, manual apply | Nightly Protech sync, blind bulk insert |
| Event public microsite | `/{orgSlug}/e/[slug]` | Published event page, registration, speakers/sponsors when configured | Full conference ops automation |
| Public member store | `/{orgSlug}/store` | Product catalog, Stripe/manual checkout | 100+ payment gateways, auto GL posting |
| Public directory | `/{orgSlug}/directory` | Active-member search with role filters when enabled | Full community SSO directory |
| Member portal preview | `/{orgSlug}/portal` | Staff preview of linked-member self-service | Full member SSO for all users |
| Insights widget board | `/{orgSlug}/insights` | Drag-reorder KPI widgets, manual snapshot | Power BI embed, unattended scheduled email |
| MemberPulse engagement | `/{orgSlug}/members/pulse` | Rule-based tiers and at-risk list in demo | ML scoring, unattended nightly jobs as Live |
| Membership analytics | `/{orgSlug}/members/analytics` | Board KPIs from tenant data (renewal pipeline, tiers) | Warehouse-fed executive exports as Live |
| Hospital PAC preview | Marketing + `/{orgSlug}/giving` | Illustrative PAC pacing in marketing; donations alpha | FEC filing, compliance workflows, dedicated PAC admin |
| Protech comparison | `/compare-protech` | Honest Live/Alpha/Roadmap matrix vs typical Protech capabilities | Feature parity, market share claims, invented pricing |

## Flagship 5 (buyer-facing sales bundle)

Marketing homepage `#flagship-features`, admin hub `/{orgSlug}/flagship`, and five per-feature hubs. Registry: `lib/flagship-features.ts`. Copy: `lib/flagship-marketing.ts`.

| Buyer name | Hub route | Demo routes | Marketing label | Safe to claim | Do not claim |
|------------|-----------|-------------|-----------------|---------------|--------------|
| Executive Command Center | `/{orgSlug}/flagship/executive` | `/command-center`, `/leadership` | **Live** | One-screen CEO briefing, leadership loop script | Unattended executive email digests |
| Membership Intelligence | `/{orgSlug}/flagship/membership` | `/members/analytics`, `/members/pulse` | **Demo preview** | Board KPIs, rule-based tiers, at-risk list | ML scoring, warehouse-fed exports as Live |
| Advocacy on One Roster | `/{orgSlug}/flagship/advocacy` | `/enterprise/advocacy`, public issue pages | **Alpha** | Hospital roster linkage, issue hub, take-action | Legislative auto-feed, FEC workflows |
| Board Briefing Pack | `/{orgSlug}/flagship/board` | `/insights/board-pack`, `/insights` | **Demo preview** | Printable HTML board export, manual snapshots | Power BI embed, unattended scheduled email |
| Migration Without Rip-and-Replace | `/{orgSlug}/flagship/migration` | `/members/imports`, `/compare-protech` | **Demo preview** | CSV staging, honest compare matrix | Nightly Protech sync, feature parity, invented pricing |

Top 20 showcase at `/{orgSlug}/showcase` remains the internal depth catalog — not a substitute for Flagship 5 labels above.

## Forbidden on “available” marketing blocks

Phrases that must **not** appear in `status: "available"` copy unless the same sentence says **roadmap** or **demo preview**:

- `automated renewals`
- `full SSO`
- `Power BI` (as shipped)
- `storefront` / `e-commerce` (as fully shipped GA)
- `certification` / `CE credits` (as shipped)
- `100+ gateways` / `automated import sync`

## Enforcement

- UI: `CatalogStatus` / product badges (Live vs Roadmap)
- Code: admin routes only for available + alpha products
- CI: `scripts/validate-marketing-claims.ts`
- Ops: [SUPPORTABILITY-GATES.md](./SUPPORTABILITY-GATES.md) before flipping `available`
- UI: [UI-QUALITY-BAR.md](./UI-QUALITY-BAR.md) before claiming staff-facing GA
- Humans: grant decks checked against this file before send

**Marketing angle:** PulsePoint only marks features **Live** when operational readiness gates pass—not when decks need them. **Demo preview** means walkthrough-ready with seed data, not production automation.
