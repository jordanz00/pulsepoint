"use client";

import { useState, useTransition } from "react";
import { startPortalPendingOrderCheckout } from "@/app/actions/portal-commerce";

export function PortalOrderPayButton({
  orgSlug,
  orderId,
  amountLabel,
}: {
  orgSlug: string;
  orderId: string;
  amountLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="portal-order-pay">
      <button
        type="button"
        className="ds-btn ds-btn--primary ds-btn--sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await startPortalPendingOrderCheckout(orgSlug, orderId);
            if (res.ok) {
              window.location.href = res.redirectUrl;
              return;
            }
            setError(res.error);
          });
        }}
      >
        {pending ? "Starting…" : `Pay ${amountLabel}`}
      </button>
      {error ? <span className="portal-order-pay__error">{error}</span> : null}
    </div>
  );
}
