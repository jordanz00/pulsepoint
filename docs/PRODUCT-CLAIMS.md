# Product claims registry (marketing vs enforcement)

Marketing copy must match what code and `lib/products.ts` enforce. CI runs `pnpm claims:validate`.

## Live today (`status: "available"` / `coming_soon` ≠ these)

| Product ID | Public name | Admin route | Notes |
|------------|-------------|-------------|-------|
| `work` | PulsePoint Work | `/{orgSlug}` admin shell | |
| `members` | MemberCore | `/{orgSlug}/members` | No automated renewals yet |
| `events` | PulsePoint Events | `/{orgSlug}/events` | Paid reg via Stripe when configured |

## Roadmap only (`coming_soon` in `lib/products.ts`)

| Product ID | Do **not** claim in grants/decks |
|------------|----------------------------------|
| `learn` | CE, certifications, LMS |
| `giving` | Donor CRM, campaigns |
| `commerce` | Storefront, dues cart |
| `engage` | Email campaigns, segmentation |
| `insights` | BI dashboards, Power BI |
| `ai` | AI assistants on member data |

## Forbidden on “available” marketing blocks

Phrases that must **not** appear in `status: "available"` copy unless the same sentence says **roadmap**:

- `automated renewals`
- `full SSO`
- `Power BI` (as shipped)
- `storefront` / `e-commerce` (as shipped)
- `certification` / `CE credits` (as shipped)

## Enforcement

- UI: `CatalogStatus` / product badges (Live vs Roadmap)
- Code: admin routes only for available products
- CI: `scripts/validate-marketing-claims.ts`
- Humans: grant decks checked against this file before send
