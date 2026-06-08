/** Client-safe metric catalog for report schedule UI (no database imports). */

export const REPORT_METRIC_CATALOG = [
  { id: "revenue.total", label: "Total revenue", group: "revenue" },
  { id: "revenue.dues", label: "Dues revenue", group: "revenue" },
  { id: "revenue.non_dues", label: "Non-dues revenue", group: "revenue" },
  { id: "members.active", label: "Active members", group: "members" },
  { id: "members.at_risk", label: "At-risk members", group: "members" },
  { id: "members.lapsed", label: "Lapsed members", group: "members" },
  { id: "members.renewal_due_30", label: "Renewals due (30 days)", group: "members" },
  { id: "members.hospital_accounts", label: "Hospital accounts", group: "members" },
  { id: "membership.retention_pct", label: "Retention rate (%)", group: "members" },
  { id: "membership.renewal_overdue", label: "Renewal overdue", group: "members" },
  { id: "events.registrations", label: "Event registrations", group: "events" },
  { id: "events.published", label: "Published events", group: "events" },
] as const;
