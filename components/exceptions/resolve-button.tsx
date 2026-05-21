"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resolveException } from "@/app/actions/exceptions";

export function ResolveExceptionButton({ exceptionId }: { exceptionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await resolveException(exceptionId);
        setPending(false);
        router.refresh();
      }}
    >
      {pending ? "…" : "Mark resolved"}
    </Button>
  );
}
