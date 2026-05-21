"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteMember } from "@/app/actions/members";

export function DeleteMemberButton({
  orgSlug,
  memberId,
}: {
  orgSlug: string;
  memberId: string;
}) {
  const router = useRouter();

  return (
    <Button
      variant="danger"
      onClick={async () => {
        if (!confirm("Delete this member?")) return;
        const result = await deleteMember(memberId);
        if (result.ok) {
          router.push(`/${orgSlug}/members`);
          router.refresh();
        }
      }}
    >
      Delete
    </Button>
  );
}
