# Nimble → PulsePoint — feature map (reference)

Reference: [Nimble CRM](https://www.nimble.com/) (May 2026). **Excluded:** AI Prospect Marketing & Outreach, AI Email Marketing.

> **Canonical repo:** `/Users/jordanzabady/Desktop/pulse`  
> **Note:** Association CRM (members, deals, engage, CRM hub) lives in the **main Next.js app**, not in `packages/api`. The archived standalone `packages/web` + `/crm/*` API was **not** merged — ad-ops in `pulse` is campaigns/sync/audit only (12 Prisma models).

## Where features live today

| Nimble area | PulsePoint (canonical) |
|-------------|------------------------|
| Relationship management | `/[orgSlug]/crm`, `/members`, contacts |
| Sales, pipelines, reporting | `/[orgSlug]/deals`, pipeline, reports |
| Inbox, mobile, social | `/[orgSlug]/engage`, CRM everywhere |
| Workflows | `/[orgSlug]/crm/workflows` |
| Web forms | `/[orgSlug]/crm/forms` |
| Microsoft 365 / Google | `/[orgSlug]/enterprise/integrations`, `lib/adapters/microsoft365/` |
| Email / sequences | `/[orgSlug]/engage/sequences` |
| Marketplace | Enterprise integrations (pilot) |
| **Campaign trafficking (ad-ops)** | `/[orgSlug]/advertising/*` + `packages/api` |

## Ad-ops only (healthcare advertising)

| Surface | Route | API |
|---------|-------|-----|
| Dashboard | `/advertising` | `/campaigns`, `/sync/jobs`, `/onboarding/checklist` |
| Campaigns | `/advertising/campaigns` | `/campaigns` |
| Sync queue | `/advertising/sync` | `/sync/jobs` |
| Audit log | `/advertising/audit` | audit routes |
| Metrics | `/advertising/metrics` | metric registry |
| Runbooks | `/advertising/runbooks/[code]` | shared runbooks |
| Onboarding | `/advertising/onboarding` | checklist |

## Archived-only (do not port unless scoped)

The frozen archive had a **standalone Nimble-parity CRM** (20 extra Prisma models, `/console/*`, marketing site on `:3001`). That duplicate CRM stack is **superseded** by the association AMS in `pulse`. Port only if you explicitly want a second CRM product — you do not.
