"use client";

import { useState, useTransition } from "react";
import { addCommunityDocument } from "@/app/actions/communities";

export function CommunityDocumentForm({
  orgSlug,
  spaceId,
}: {
  orgSlug: string;
  spaceId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="pc-card space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await addCommunityDocument(orgSlug, spaceId, {
            title: String(fd.get("title") ?? ""),
            url: String(fd.get("url") ?? ""),
          });
          setMsg(res.ok ? "Document added." : res.error);
          if (res.ok) e.currentTarget.reset();
        });
      }}
    >
      <h3 className="pc-section-title text-base">Add document link</h3>
      <p className="text-xs text-[var(--pc-text-secondary)]">
        Paste an https link to board packets, minutes, or shared drives. File upload versioning is
        roadmap.
      </p>
      <input name="title" required maxLength={200} placeholder="Title" className="pc-input" />
      <input
        name="url"
        required
        type="url"
        maxLength={500}
        placeholder="https://…"
        className="pc-input"
      />
      <button type="submit" className="pc-btn-primary text-sm" disabled={pending}>
        {pending ? "Saving…" : "Add document"}
      </button>
      {msg ? <p className="text-sm text-[var(--pc-text-secondary)]">{msg}</p> : null}
    </form>
  );
}
