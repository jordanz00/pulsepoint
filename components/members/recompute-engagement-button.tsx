"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { recomputeMemberEngagement } from "@/app/actions/engagement";

export function RecomputeEngagementButton({
  orgSlug,
  memberId,
}: {
  orgSlug: string;
  memberId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="pc-btn-secondary text-sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await recomputeMemberEngagement(orgSlug, memberId);
          router.refresh();
        })
      }
    >
      {pending ? "Refreshing…" : "Refresh MemberPulse"}
    </button>
  );
}
