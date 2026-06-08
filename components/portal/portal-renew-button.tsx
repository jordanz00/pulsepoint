"use client";

import { useState, useTransition } from "react";
import { startMemberRenewalCheckout } from "@/app/actions/member-renewal";

export function PortalRenewButton({
  orgSlug,
  label = "Pay renewal",
}: {
  orgSlug: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        className="ds-btn ds-btn--primary ds-btn--sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await startMemberRenewalCheckout(orgSlug);
            if (res.ok && res.redirectUrl) {
              window.location.href = res.redirectUrl;
              return;
            }
            setError(res.ok ? "Checkout unavailable." : res.error);
          });
        }}
      >
        {pending ? "Starting…" : label}
      </button>
      {error ? (
        <span className="text-xs text-[var(--ds-fg-muted)] max-w-[12rem] text-right">
          {error}
        </span>
      ) : null}
    </div>
  );
}
