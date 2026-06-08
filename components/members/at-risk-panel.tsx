import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function AtRiskPanel({
  orgSlug,
  members,
}: {
  orgSlug: string;
  members: {
    id: string;
    firstName: string;
    lastName: string;
    engagementScore: number;
    renewalDueAt: Date | null;
  }[];
}) {
  if (members.length === 0) return null;
  return (
    <section className="pc-card">
      <h2 className="pc-section-title">At-risk members</h2>
      <p className="pc-section-lead">Low engagement or overdue renewal — prioritize outreach.</p>
      <ul className="pc-simple-list mt-4">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-4">
            <div>
              <Link href={`/${orgSlug}/members/${m.id}`} className="font-medium hover:underline">
                {m.firstName} {m.lastName}
              </Link>
              <p className="text-sm text-[var(--pc-text-secondary)]">
                MemberPulse {m.engagementScore}
                {m.renewalDueAt ? ` · Due ${m.renewalDueAt.toLocaleDateString()}` : ""}
              </p>
            </div>
            <Badge variant="warning">At risk</Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}
