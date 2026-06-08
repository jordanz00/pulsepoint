import Link from "next/link";
import { MemberPulseGauge } from "@/components/members/member-pulse-gauge";
import type { EngagementTier } from "@/lib/engagement-score";

export function MemberPulseScoreCell({
  orgSlug,
  memberId,
  score,
  tier,
}: {
  orgSlug: string;
  memberId: string;
  score: number;
  tier: EngagementTier;
}) {
  return (
    <Link
      href={`/${orgSlug}/members/${memberId}#member-pulse`}
      className="inline-flex items-center gap-2 hover:opacity-80"
      title="View MemberPulse"
    >
      <MemberPulseGauge score={score} tier={tier} size="sm" showLabel={false} />
    </Link>
  );
}
