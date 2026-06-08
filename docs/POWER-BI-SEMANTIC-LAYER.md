# Power BI semantic layer — PulsePoint pilot export

**Status:** Import path live; native embed on roadmap (honest vs Protech).

## Export command

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm continuity:export
```

Produces warehouse-ready CSV snapshots under `continuity/exports/` (gitignored).

## Gold tables (pilot naming)

| Table | Source | Refresh |
|-------|--------|---------|
| `dim_organization` | `Organization` | On export |
| `dim_member` | `Member` + tags | On export |
| `fact_revenue` | Commerce orders + donations + paid registrations | On export |
| `fact_event_registration` | `EventRegistration` | On export |
| `fact_audit` | `AuditLog` (redacted) | On export |
| `fact_executive_kpi` | `loadExecutiveDashboard()` snapshot | On export |
| `fact_membership_analytics` | `loadMembershipAnalytics()` summary rows | On export |
| `fact_advocacy_hospital_participation` | `loadAdvocacyDashboardStats()` | On export |
| `dim_engagement_tier` | Engagement tier breakdown | On export |
| `dim_hospital_account` | Top hospital accounts by roster size | On export |

## Metric keys (executive dashboard)

| MetricKey | Label | Unit |
|-----------|-------|------|
| `revenue.total` | Total recorded revenue | USD |
| `revenue.dues` | Dues revenue | USD |
| `revenue.non_dues` | Non-dues revenue | USD |
| `members.active` | Active members | count |
| `members.at_risk` | At-risk members | count |
| `members.lapsed` | Lapsed members | count |
| `members.renewal_due_30` | Renewals due (30 days) | count |
| `events.published` | Published events | count |
| `events.registrations` | Event registrations | count |

## Power BI setup (pilot)

1. Import CSVs from `continuity:export`
2. Model relationships: `dim_member.memberId` → fact tables
3. DAX measures mirror `lib/executive-metrics.ts` aggregations
4. Pin executive page to association board packet

## API alternative

`GET /api/copilot/executive-brief?orgSlug=<slug>` returns JSON briefing grounded in the same KPI source.

## Roadmap

- Semantic model JSON envelope (Fabric / Power BI dataset)
- Embedded Power BI report in `/insights` (App owns workspace + embed token via IT)
