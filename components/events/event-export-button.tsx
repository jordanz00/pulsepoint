"use client";

import { useState, useTransition } from "react";
import { exportEventAttendeesCsv } from "@/app/actions/event-operations";

export function EventExportButton({
  orgSlug,
  eventId,
  eventTitle,
}: {
  orgSlug: string;
  eventId: string;
  eventTitle: string;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="ec-inline-actions">
      <button
        type="button"
        className="pc-btn-secondary"
        disabled={pending}
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await exportEventAttendeesCsv(orgSlug, eventId);
            if (!res.ok) {
              setMsg(res.error);
              return;
            }
            const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${eventTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-attendees.csv`;
            a.click();
            URL.revokeObjectURL(url);
            setMsg(`Exported ${res.rowCount} rows.`);
          });
        }}
      >
        {pending ? "Exporting…" : "Export CSV"}
      </button>
      {msg ? <span className="ec-feedback text-sm">{msg}</span> : null}
    </div>
  );
}
