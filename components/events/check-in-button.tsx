"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleCheckIn } from "@/app/actions/events";

export function CheckInButton({
  registrationId,
  checkedIn,
}: {
  registrationId: string;
  checkedIn: boolean;
}) {
  const router = useRouter();
  return (
    <Button
      variant={checkedIn ? "secondary" : "primary"}
      onClick={async () => {
        await toggleCheckIn(registrationId);
        router.refresh();
      }}
    >
      {checkedIn ? "Undo check-in" : "Check in"}
    </Button>
  );
}
