"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addMemberNote } from "@/app/actions/member-notes";
import { createDeal } from "@/app/actions/deals";
import { startCrmWorkflowRun } from "@/app/actions/crm-workflows";
import { updateContactFollowUp } from "@/app/actions/contact-record";
import { ContactRecordDrawer, useDrawerState } from "@/components/crm/contact-record/contact-record-drawer";
import type { ContactRecordData } from "@/lib/contact-record/types";

const QUICK_ACTIONS = [
  { id: "note", label: "Add note" },
  { id: "activity", label: "Log activity" },
  { id: "schedule", label: "Schedule" },
  { id: "touch", label: "Stay in touch" },
  { id: "deal", label: "Add partnership" },
  { id: "workflow", label: "Add workflow" },
] as const;

export function ContactRecordQuickActions({
  orgSlug,
  memberId,
  data,
}: {
  orgSlug: string;
  memberId: string;
  data: ContactRecordData;
}) {
  const router = useRouter();
  const { openDrawer, toggle, isOpen } = useDrawerState();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const m = data.member;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`pc-btn-secondary text-xs ${isOpen(a.id) ? "ring-2 ring-[var(--pc-brand)]" : ""}`}
            onClick={() => toggle(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <ContactRecordDrawer id="note" title="Add note" open={isOpen("note")} onToggle={() => toggle("note")}>
        <QuickNoteForm
          pending={pending}
          onSubmit={(body) =>
            startTransition(async () => {
              const res = await addMemberNote(memberId, { body, noteType: "RELATIONSHIP" }, orgSlug);
              setMsg(res.ok ? "Note saved." : res.error ?? "Failed");
              if (res.ok) router.refresh();
            })
          }
        />
      </ContactRecordDrawer>

      <ContactRecordDrawer
        id="activity"
        title="Log past activity"
        open={isOpen("activity")}
        onToggle={() => toggle("activity")}
      >
        <QuickNoteForm
          pending={pending}
          label="What happened?"
          channelDefault="call"
          showChannel
          onSubmit={(body, channel) =>
            startTransition(async () => {
              const res = await addMemberNote(
                memberId,
                { body, noteType: "GENERAL", channel: channel || "call" },
                orgSlug,
              );
              setMsg(res.ok ? "Activity logged." : res.error ?? "Failed");
              if (res.ok) router.refresh();
            })
          }
        />
      </ContactRecordDrawer>

      <ContactRecordDrawer
        id="schedule"
        title="Schedule follow-up"
        open={isOpen("schedule")}
        onToggle={() => toggle("schedule")}
      >
        <label className="block text-sm">
          <span className="text-zinc-500">Date & time</span>
          <input
            type="datetime-local"
            className="pc-input mt-1 w-full"
            id="schedule-dt"
          />
        </label>
        <button
          type="button"
          className="pc-btn-primary mt-3 text-sm"
          disabled={pending}
          onClick={() => {
            const el = document.getElementById("schedule-dt") as HTMLInputElement | null;
            const v = el?.value;
            if (!v) return;
            startTransition(async () => {
              const res = await updateContactFollowUp(orgSlug, memberId, new Date(v).toISOString());
              const noteRes = await addMemberNote(
                memberId,
                {
                  body: `Scheduled follow-up for ${new Date(v).toLocaleString()}`,
                  noteType: "FOLLOW_UP",
                },
                orgSlug,
              );
              const err = !res.ok ? res.error : !noteRes.ok ? noteRes.error : "Failed";
              setMsg(res.ok && noteRes.ok ? "Follow-up scheduled." : err);
              if (res.ok) router.refresh();
            });
          }}
        >
          Save schedule
        </button>
      </ContactRecordDrawer>

      <ContactRecordDrawer
        id="touch"
        title="Stay in touch"
        open={isOpen("touch")}
        onToggle={() => toggle("touch")}
      >
        <div className="flex flex-wrap gap-2">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              type="button"
              className="pc-btn-secondary text-xs"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await updateContactFollowUp(orgSlug, memberId, p);
                  setMsg(res.ok ? `Reminder set (${p}).` : res.error ?? "Failed");
                  if (res.ok) router.refresh();
                })
              }
            >
              {p === "7d" ? "1 week" : p === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
          <button
            type="button"
            className="pc-btn-secondary text-xs"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await updateContactFollowUp(orgSlug, memberId, "clear");
                setMsg(res.ok ? "Reminder cleared." : res.error ?? "Failed");
                if (res.ok) router.refresh();
              })
            }
          >
            Clear
          </button>
        </div>
        {m.nextFollowUpAt ? (
          <p className="mt-2 text-xs text-zinc-500">
            Current: {new Date(m.nextFollowUpAt).toLocaleString()}
          </p>
        ) : null}
      </ContactRecordDrawer>

      <ContactRecordDrawer
        id="deal"
        title="Add partnership"
        open={isOpen("deal")}
        onToggle={() => toggle("deal")}
      >
        <DealQuickForm
          pending={pending}
          defaultTitle={`${m.firstName} ${m.lastName} — ${m.company || "Partnership"}`}
          pipelines={data.pipelines}
          onSubmit={(title, amountCents, pipelineId) =>
            startTransition(async () => {
              const res = await createDeal(orgSlug, {
                title,
                amountCents,
                memberId,
                pipelineId,
                stage: "LEAD",
              });
              setMsg(res.ok ? "Partnership opportunity added." : res.error ?? "Failed");
              if (res.ok) router.refresh();
            })
          }
        />
      </ContactRecordDrawer>

      <ContactRecordDrawer
        id="workflow"
        title="Add to workflow"
        open={isOpen("workflow")}
        onToggle={() => toggle("workflow")}
      >
        <label className="block text-sm">
          <span className="text-zinc-500">Workflow</span>
          <select className="pc-input mt-1 w-full" id="wf-select">
            {data.workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.department || "General"})
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="pc-btn-primary mt-3 text-sm"
          disabled={pending || data.workflows.length === 0}
          onClick={() => {
            const el = document.getElementById("wf-select") as HTMLSelectElement | null;
            const wfId = el?.value;
            if (!wfId) return;
            startTransition(async () => {
              const res = await startCrmWorkflowRun(wfId, memberId, orgSlug);
              setMsg(res.ok ? "Added to workflow." : res.error ?? "Failed");
              if (res.ok) router.refresh();
            });
          }}
        >
          Add card
        </button>
      </ContactRecordDrawer>

      {msg ? <p className="text-sm text-zinc-600">{msg}</p> : null}
    </div>
  );
}

function QuickNoteForm({
  pending,
  label = "Note",
  channelDefault,
  showChannel,
  onSubmit,
}: {
  pending: boolean;
  label?: string;
  channelDefault?: string;
  showChannel?: boolean;
  onSubmit: (body: string, channel?: string) => void;
}) {
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState(channelDefault ?? "");

  return (
    <div className="space-y-3">
      {showChannel ? (
        <label className="block text-sm">
          <span className="text-zinc-500">Channel</span>
          <select
            className="pc-input mt-1 w-full"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="linkedin">LinkedIn</option>
            <option value="in_person">In person</option>
          </select>
        </label>
      ) : null}
      <label className="block text-sm">
        <span className="text-zinc-500">{label}</span>
        <textarea
          className="pc-input mt-1 w-full"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="pc-btn-primary text-sm"
        disabled={pending || !body.trim()}
        onClick={() => onSubmit(body, channel)}
      >
        Save
      </button>
    </div>
  );
}

function DealQuickForm({
  pending,
  defaultTitle,
  pipelines,
  onSubmit,
}: {
  pending: boolean;
  defaultTitle: string;
  pipelines: { id: string; name: string }[];
  onSubmit: (title: string, amountCents: number, pipelineId?: string) => void;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [amount, setAmount] = useState("0");
  const [pipelineId, setPipelineId] = useState(pipelines[0]?.id ?? "");

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="text-zinc-500">Title</span>
        <input className="pc-input mt-1 w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Amount ($)</span>
        <input
          type="number"
          min={0}
          className="pc-input mt-1 w-full"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      {pipelines.length > 0 ? (
        <label className="block text-sm">
          <span className="text-zinc-500">Pipeline</span>
          <select
            className="pc-input mt-1 w-full"
            value={pipelineId}
            onChange={(e) => setPipelineId(e.target.value)}
          >
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        type="button"
        className="pc-btn-primary text-sm"
        disabled={pending || !title.trim()}
        onClick={() =>
          onSubmit(title, Math.round(parseFloat(amount || "0") * 100), pipelineId || undefined)
        }
      >
        Create partnership
      </button>
    </div>
  );
}
