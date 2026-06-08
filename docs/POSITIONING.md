# PulsePoint positioning

## Hero

- **Eyebrow:** Association Management Software  
- **Headline:** PulsePoint — Association Management Software Built for Healthcare  

## Tagline (internal / legacy)

**Association Management Software Built for Healthcare.**

## Origin story

Built by an association that got tired of paying millions for outdated software.

## What makes it different

**North star:** operational trust—predictable behavior under association workflows (imports, money, permissions, audit, exceptions)—not feature count.

- **Honest Live labels** — features marked Live only after operational readiness gates (`pnpm claims:validate`, [PRODUCT-CLAIMS.md](./PRODUCT-CLAIMS.md))
- **Operationally trustworthy** — staged imports, exception queues, runbooks, export parity
- **Visually modern** — enforceable [UI-QUALITY-BAR.md](./UI-QUALITY-BAR.md); staff UI that stays consistent
- Fewest clicks to common tasks; one screen per member
- Lower implementation cost than legacy AMS lock-in
- Modular architecture — graduate modules one at a time, not Protech parity in one pass

**Positioning line for leadership:**

> “PulsePoint only marks features **Live** when they pass operational readiness gates—not when a slide deck needs them.”

## Marketing IA (Protech-competitive)

Familiar AMS homepage structure—PulsePoint voice, honest **Live** vs **Roadmap** labels:

1. **Book a call** / **Request a demo** (header + hero)
2. **Advance your association** — integrated suite value prop
3. **Personas** — Members, Leaders, Staff
4. **Features** — 8-category grid (Membership, Meetings & Events, Education, …)
5. **What makes it different** — 8 differentiators
6. **Social proof** — healthcare member-based orgs (no fabricated logos)
7. **Quick tour** — sign-up sandbox CTA

Catalog: `lib/marketing-catalog.ts`  
Long-form copy: `lib/marketing-content.ts` (Work, MemberCore, Events, Learn, Giving, Commerce, Engage, Insights spotlights, FAQ, core features)

**Compliance:** Marketing UI labels capabilities **Live** vs **Roadmap**. Power BI, full SSO, automated renewals, and certifications are roadmap unless marked Live.

## Feature pillars (operational)

| Pillar | Scope | Status |
|--------|--------|--------|
| Work | Staff workspace, UX, productivity | Shipped → **PulsePoint Work** |
| Members | Profiles, renewals, directories | Shipped → **MemberCore** |
| Events | Conferences, registrations, CME | Shipped → PulsePoint Events |
| Education | Certifications, CE credits, learning pathways | Roadmap → PulsePoint Learn |
| Fundraising | Donors, campaigns, recurring gifts | Roadmap → PulsePoint Giving |
| Commerce | Storefronts, dues, merchandise, payments | Roadmap → PulsePoint Commerce |
| Committees | Boards, task forces, voting | Roadmap |
| Communications | Campaigns, segmentation, engagement | Roadmap → PulsePoint Engage |
| Insights | BI, dashboards, role-based reporting | Alpha → PulsePoint Insights |

## Design direction

- **Palette:** dark navy + white; subtle sky/cyan accents (not cliché medical clipart)
- **Feel:** Linear, Notion, Ramp, Vanta—not “hospital software”
- **Tokens:** `app/globals.css` (`--pc-navy`, `--pc-accent`, etc.)

## Domain strategy

| Priority | Domain |
|----------|--------|
| Ideal | `pulsepoint.com` |
| Realistic | `pulsepointams.com`, `getpulsepoint.com`, `pulsepointhealth.com`, `pulsepointplatform.com` |

See also `docs/TRADEMARK.md`.

## Builder advantage

Successful B2B AMS often starts internal: operators who know workflows, politics, reporting pain, and daily admin needs—then productize. PulsePoint follows that pattern.

Canonical copy: `lib/brand.ts`, `lib/feature-pillars.ts`, `lib/products.ts`.
