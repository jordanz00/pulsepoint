"use client";

import { useTransition } from "react";
import { processEventRefund } from "@/app/actions/event-advanced";

export function EventRefundActions({
  orgSlug,
  registrationId,
  refundStatus,
  paid,
}: {
  orgSlug: string;
  registrationId: string;
  refundStatus: string;
  paid: boolean;
}) {
  const [pending, startTransition] = useTransition();
  if (!paid && refundStatus === "NONE") return null;

  return (
    <div className="flex flex-wrap gap-1">
      {refundStatus === "NONE" ? (
        <button
          type="button"
          className="pc-btn-secondary text-xs"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await processEventRefund(orgSlug, { registrationId, action: "request" });
            })
          }
        >
          Request refund
        </button>
      ) : null}
      {refundStatus === "REQUESTED" ? (
        <>
          <button
            type="button"
            className="pc-btn-secondary text-xs"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await processEventRefund(orgSlug, { registrationId, action: "approve" });
              })
            }
          >
            Approve
          </button>
          <button
            type="button"
            className="pc-btn-secondary text-xs"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await processEventRefund(orgSlug, { registrationId, action: "deny" });
              })
            }
          >
            Deny
          </button>
        </>
      ) : null}
      {refundStatus === "APPROVED" ? (
        <button
          type="button"
          className="pc-btn-primary text-xs"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await processEventRefund(orgSlug, { registrationId, action: "complete" });
            })
          }
        >
          Mark refunded
        </button>
      ) : null}
      {refundStatus !== "NONE" ? (
        <span className="text-xs text-[var(--readable-on-light-muted)]">{refundStatus}</span>
      ) : null}
    </div>
  );
}
