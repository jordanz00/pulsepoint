"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleCheckIn } from "@/app/actions/events";

export function CheckInButton({
  orgSlug,
  registrationId,
  checkedIn,
}: {
  orgSlug: string;
  registrationId: string;
  checkedIn: boolean;
}) {
  const router = useRouter();
  return (
    <Button
      className="ec-check-in-btn min-h-11 min-w-[7.5rem]"
      variant={checkedIn ? "secondary" : "primary"}
      onClick={async () => {
        await toggleCheckIn(registrationId, orgSlug);
        router.refresh();
      }}
    >
      {checkedIn ? "Undo check-in" : "Check in"}
    </Button>
  );
}
