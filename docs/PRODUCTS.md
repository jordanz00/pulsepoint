# PulsePoint product suite

Canonical product names (use in UI, marketing, and contracts):

| Product | Route | Status |
|---------|-------|--------|
| **PulsePoint Work** (Staff Experience & Productivity) | `/{orgSlug}/work` | Shipped (admin workspace; MemberCore + Events live) |
| **MemberCore** (Membership Management) | `/{orgSlug}/members` | Shipped |
| **PulsePoint Events** (Events, Sponsorships & Exhibits) | `/{orgSlug}/events` | Shipped (registration, check-in); sponsorships/exhibits roadmap |
| **PulsePoint Learn** (Education & Certifications) | `/{orgSlug}/learn` | Alpha |
| **PulsePoint Giving** (Fundraising & Donor Management) | `/{orgSlug}/giving` | Alpha |
| **PulsePoint Commerce** (E-Commerce & Payments) | `/{orgSlug}/commerce` | Alpha (event Stripe checkout live in PulsePoint Events) |
| **PulsePoint Engage** (Marketing & Communications) | `/{orgSlug}/engage` | Alpha |
| **PulsePoint Insights** (Business Intelligence & Analytics) | `/{orgSlug}/insights` | Alpha (MemberCore CSV export live today) |

Source of truth in code: `lib/products.ts`.

Operational pillars (Members, Events, Billing, Committees, Communications, Insights): `lib/feature-pillars.ts`. Product spotlights in `lib/marketing-content.ts`: Work, MemberCore, Events, Learn, Giving, Commerce, Engage, Insights.

Positioning and design direction: `docs/POSITIONING.md`, `lib/brand.ts`.
