"use client";

import { useState, useTransition } from "react";
import {
  cloneEvent,
  saveEventPlannerConfig,
  setEventLifecycleStatus,
  updateEventVenueAndRegistration,
} from "@/app/actions/event-operations";
import { promoteWaitlistBatch } from "@/app/actions/event-registration-admin";
import type { EventPlannerConfig, PlannerTask } from "@/lib/event-planner-config";
import { useRouter } from "next/navigation";

export type EventPlannerProps = {
  orgSlug: string;
  eventId: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  venueName: string;
  venueAddress: string;
  timezone: string;
  format: "IN_PERSON" | "VIRTUAL" | "HYBRID";
  registrationOpensAt: string;
  registrationClosesAt: string;
  waitlistEnabled: boolean;
  waitlistCount: number;
  planner: EventPlannerConfig;
};

export function EventPlannerPanel(props: EventPlannerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<PlannerTask[]>(props.planner.checklist);
  const [budgetNotes, setBudgetNotes] = useState(props.planner.budgetNotes ?? "");
  const [internalNotes, setInternalNotes] = useState(props.planner.internalNotes ?? "");

  function savePlanner() {
    startTransition(async () => {
      const res = await saveEventPlannerConfig(props.orgSlug, props.eventId, {
        checklist,
        budgetNotes,
        internalNotes,
      });
      setMsg(res.ok ? "Planner saved." : res.error);
    });
  }

  return (
    <section className="ec-panel glass pp-readable-on-light" id="eventcore-planner">
      <h2 className="ec-panel-title">Planner & operations</h2>
      <p className="ec-panel-lead">
        Venue, registration window, lifecycle, waitlist promotion, and internal checklist.
      </p>

      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await updateEventVenueAndRegistration(props.orgSlug, props.eventId, {
              venueName: String(fd.get("venueName") ?? ""),
              venueAddress: String(fd.get("venueAddress") ?? ""),
              timezone: String(fd.get("timezone") ?? ""),
              format: String(fd.get("format") ?? "IN_PERSON"),
              registrationOpensAt: String(fd.get("registrationOpensAt") ?? "") || null,
              registrationClosesAt: String(fd.get("registrationClosesAt") ?? "") || null,
              waitlistEnabled: fd.get("waitlistEnabled") === "on",
            });
            setMsg(res.ok ? "Venue & registration window saved." : res.error);
          });
        }}
      >
        <div className="ec-form-row sm:col-span-2">
          <label className="ec-label">Venue name</label>
          <input name="venueName" className="ec-input" defaultValue={props.venueName} />
        </div>
        <div className="ec-form-row sm:col-span-2">
          <label className="ec-label">Address / virtual link notes</label>
          <input name="venueAddress" className="ec-input" defaultValue={props.venueAddress} />
        </div>
        <div className="ec-form-row">
          <label className="ec-label">Timezone</label>
          <input name="timezone" className="ec-input" defaultValue={props.timezone} />
        </div>
        <div className="ec-form-row">
          <label className="ec-label">Format</label>
          <select name="format" className="ec-input" defaultValue={props.format}>
            <option value="IN_PERSON">In person</option>
            <option value="VIRTUAL">Virtual</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
        <div className="ec-form-row">
          <label className="ec-label">Registration opens</label>
          <input
            name="registrationOpensAt"
            type="datetime-local"
            className="ec-input"
            defaultValue={props.registrationOpensAt}
          />
        </div>
        <div className="ec-form-row">
          <label className="ec-label">Registration closes</label>
          <input
            name="registrationClosesAt"
            type="datetime-local"
            className="ec-input"
            defaultValue={props.registrationClosesAt}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            name="waitlistEnabled"
            type="checkbox"
            defaultChecked={props.waitlistEnabled}
          />
          Enable waitlist when at capacity
        </label>
        <button type="submit" className="pc-btn-primary sm:col-span-2" disabled={pending}>
          Save venue & window
        </button>
      </form>

      <div className="ec-lifecycle mt-6 flex flex-wrap gap-2">
        <span className="text-sm font-semibold text-[var(--readable-on-light-fg)]">
          Lifecycle:
        </span>
        {(["PUBLISHED", "COMPLETED", "CANCELLED"] as const).map((s) => (
          <button
            key={s}
            type="button"
            className="pc-btn-secondary text-xs"
            disabled={pending || props.status === s}
            onClick={() =>
              startTransition(async () => {
                const res = await setEventLifecycleStatus(props.orgSlug, props.eventId, s);
                setMsg(res.ok ? `Status → ${s}` : res.error);
              })
            }
          >
            Mark {s}
          </button>
        ))}
      </div>

      {props.waitlistCount > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm">
            {props.waitlistCount} on waitlist
          </span>
          <button
            type="button"
            className="pc-btn-secondary text-xs"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await promoteWaitlistBatch(props.orgSlug, props.eventId, 10);
                setMsg(res.ok ? `Promoted ${res.promoted}.` : res.error);
              })
            }
          >
            Promote next 10
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        <h3 className="text-sm font-bold text-[var(--readable-on-light-fg)]">Checklist</h3>
        <ul className="mt-2 space-y-2">
          {checklist.map((t, i) => (
            <li key={t.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={t.done}
                onChange={(e) => {
                  const next = [...checklist];
                  next[i] = { ...t, done: e.target.checked };
                  setChecklist(next);
                }}
              />
              <span className={t.done ? "line-through opacity-60" : ""}>{t.label}</span>
            </li>
          ))}
        </ul>
        <textarea
          className="ec-input ec-textarea mt-3"
          rows={2}
          placeholder="Budget notes"
          value={budgetNotes}
          onChange={(e) => setBudgetNotes(e.target.value)}
        />
        <textarea
          className="ec-input ec-textarea mt-2"
          rows={2}
          placeholder="Internal notes (staff only)"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
        />
        <button type="button" className="pc-btn-primary mt-3" disabled={pending} onClick={savePlanner}>
          Save planner
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="pc-btn-secondary"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await cloneEvent(props.orgSlug, props.eventId);
              if (res.ok) {
                router.push(`/${props.orgSlug}/events/${res.eventId}`);
              } else setMsg(res.error);
            })
          }
        >
          Duplicate event
        </button>
      </div>

      {msg ? <p className="ec-feedback mt-3">{msg}</p> : null}
    </section>
  );
}
