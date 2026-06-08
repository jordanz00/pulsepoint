/**
 * Renewals staff report — CSV export + summary counts for MemberCore renewals page.
 */

import { escapeCsvCell } from "@/lib/giving/csv";
import { isRenewalCronEnabled } from "@/lib/jobs/cron-gates";

export type RenewalMemberRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  renewalDueAt: Date | null;
  tierName: string | null;
};

export function renewalCronStatusLabel(): { enabled: boolean; label: string; hint: string } {
  const enabled = isRenewalCronEnabled();
  return {
    enabled,
    label: enabled ? "Renewal cron live" : "Renewal cron gated",
    hint: enabled
      ? "Platform cron sends 90/60/30/14/7-day reminders."
      : "Set PULSE_CRON_RENEWALS=true after Stripe pilot drill (docs/STRIPE-PILOT-DRILL.md).",
  };
}

export function summarizeRenewals(members: RenewalMemberRow[], now = new Date()) {
  let overdue = 0;
  let dueSoon = 0;
  for (const m of members) {
    if (!m.renewalDueAt) continue;
    const days = Math.ceil((m.renewalDueAt.getTime() - now.getTime()) / 86400000);
    if (days < 0) overdue += 1;
    else dueSoon += 1;
  }
  return { total: members.length, overdue, dueSoon };
}

export function buildRenewalsDueCsv(members: RenewalMemberRow[]): string {
  const lines = ["member_id,name,email,tier,renewal_due_at,status"];
  const now = new Date();
  for (const m of members) {
    const name = `${m.firstName} ${m.lastName}`.trim();
    const days = m.renewalDueAt
      ? Math.ceil((m.renewalDueAt.getTime() - now.getTime()) / 86400000)
      : null;
    const status =
      days == null ? "unknown" : days < 0 ? "overdue" : days <= 30 ? "due_soon" : "upcoming";
    lines.push(
      [
        m.id,
        escapeCsvCell(name),
        m.email ?? "",
        escapeCsvCell(m.tierName ?? ""),
        m.renewalDueAt?.toISOString() ?? "",
        status,
      ].join(","),
    );
  }
  return lines.join("\n");
}
