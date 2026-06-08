"use client";

import { useState, useTransition } from "react";
import { createAudience, createTemplate, sendCampaign } from "@/app/actions/engage";

export function EngageQuickAdd({
  orgSlug,
  templates,
  audiences,
  defaultAudienceId,
}: {
  orgSlug: string;
  templates: { id: string; name: string }[];
  audiences: { id: string; name: string }[];
  defaultAudienceId?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        className="pc-card"
        action={(form) =>
          startTransition(async () => {
            const r = await createTemplate(orgSlug, {
              name: String(form.get("name") ?? ""),
              subject: String(form.get("subject") ?? ""),
              bodyText: String(form.get("bodyText") ?? ""),
              approved: form.get("approved") === "on",
            });
            setMessage(r.ok ? "Template saved." : r.error);
          })
        }
      >
        <h3 className="text-sm font-semibold text-[var(--pc-text)]">New template</h3>
        <div className="mt-3 grid gap-2">
          <input name="name" required placeholder="Name" className="rounded-md border px-3 py-2 text-sm" />
          <input name="subject" required placeholder="Subject" className="rounded-md border px-3 py-2 text-sm" />
          <textarea name="bodyText" required placeholder="Plain text body" rows={4} className="rounded-md border px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="approved" /> Approved for send</label>
        </div>
        <button type="submit" disabled={pending} className="pc-btn-primary mt-3 text-sm">
          {pending ? "Saving…" : "Save template"}
        </button>
      </form>

      <form
        className="pc-card"
        action={(form) =>
          startTransition(async () => {
            const r = await createAudience(orgSlug, {
              name: String(form.get("name") ?? ""),
              description: String(form.get("description") ?? ""),
              filter: {
                status: (String(form.get("status") ?? "") || undefined) as "ACTIVE" | "INACTIVE" | "LAPSED" | undefined,
                tag: String(form.get("tag") ?? "") || undefined,
              },
            });
            setMessage(r.ok ? "Audience saved." : r.error);
          })
        }
      >
        <h3 className="text-sm font-semibold text-[var(--pc-text)]">New audience</h3>
        <div className="mt-3 grid gap-2">
          <input name="name" required placeholder="Name" className="rounded-md border px-3 py-2 text-sm" />
          <input name="description" placeholder="Description" className="rounded-md border px-3 py-2 text-sm" />
          <select name="status" className="rounded-md border px-3 py-2 text-sm">
            <option value="">Any status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="LAPSED">Lapsed</option>
          </select>
          <input name="tag" placeholder="Tag (optional)" className="rounded-md border px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={pending} className="pc-btn-primary mt-3 text-sm">
          {pending ? "Saving…" : "Save audience"}
        </button>
      </form>

      <form
        id="engage-send-campaign"
        className="pc-card"
        action={(form) =>
          startTransition(async () => {
            const r = await sendCampaign(orgSlug, {
              templateId: String(form.get("templateId") ?? ""),
              audienceId: String(form.get("audienceId") ?? ""),
            });
            setMessage(r.ok ? `Campaign sent (${r.sent}/${r.attempted}).` : r.error);
          })
        }
      >
        <h3 className="text-sm font-semibold text-[var(--pc-text)]">Send campaign</h3>
        {defaultAudienceId ? (
          <p className="mt-1 text-xs text-[var(--pc-text-tertiary)]">
            Audience pre-selected from advocacy launch.
          </p>
        ) : null}
        <div className="mt-3 grid gap-2">
          <select name="templateId" required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Approved template…</option>
            {templates.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
          <select
            name="audienceId"
            required
            defaultValue={defaultAudienceId ?? ""}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Audience…</option>
            {audiences.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
          </select>
        </div>
        <button type="submit" disabled={pending} className="pc-btn-primary mt-3 text-sm">
          {pending ? "Sending…" : "Send"}
        </button>
        <p className="mt-2 text-xs text-[var(--pc-text-tertiary)]">Throttled to {process.env.NEXT_PUBLIC_ENGAGE_SEND_LIMIT ?? 50} recipients in alpha.</p>
      </form>

      {message && <p className="text-xs text-[var(--pc-text-secondary)] lg:col-span-3">{message}</p>}
    </div>
  );
}
