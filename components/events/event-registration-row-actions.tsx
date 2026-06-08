"use client";

import { useState, useTransition } from "react";
import {
  updateRegistrationNotes,
  updateRegistrationStatus,
} from "@/app/actions/event-registration-admin";

const STATUSES = ["PENDING", "CONFIRMED", "WAITLIST", "CANCELLED"] as const;

export function EventRegistrationRowActions({
  orgSlug,
  registrationId,
  currentStatus,
  staffNotes,
}: {
  orgSlug: string;
  registrationId: string;
  currentStatus: string;
  staffNotes: string;
}) {
  const [notes, setNotes] = useState(staffNotes);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="ec-reg-actions">
      <select
        className="ec-input text-xs"
        value={currentStatus}
        disabled={pending}
        onChange={(e) => {
          const status = e.target.value as (typeof STATUSES)[number];
          startTransition(async () => {
            const res = await updateRegistrationStatus(orgSlug, registrationId, status);
            setMsg(res.ok ? null : res.error);
          });
        }}
        aria-label="Registration status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        className="ec-input text-xs"
        placeholder="Staff notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if (notes === staffNotes) return;
          startTransition(async () => {
            await updateRegistrationNotes(orgSlug, registrationId, notes);
          });
        }}
      />
      {msg ? <span className="text-xs text-red-700">{msg}</span> : null}
    </div>
  );
}
