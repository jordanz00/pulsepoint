"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteMemberOrganization } from "@/app/actions/member-organizations";

export function DeleteOrganizationButton({
  orgSlug,
  accountId,
  accountName,
}: {
  orgSlug: string;
  accountId: string;
  accountName: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={async () => {
          if (
            !confirm(
              `Delete "${accountName}"? Members and subsidiaries must be reassigned first.`,
            )
          ) {
            return;
          }
          setPending(true);
          const res = await deleteMemberOrganization(accountId, orgSlug);
          setPending(false);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          router.push(`/${orgSlug}/enterprise/organizations`);
          router.refresh();
        }}
      >
        {pending ? "Deleting…" : "Delete account"}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
