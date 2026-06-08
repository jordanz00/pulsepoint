"use client";

import { useState, useTransition } from "react";
import { createCommunitySpace } from "@/app/actions/communities";

export function CommunitySpaceForm({ orgSlug }: { orgSlug: string }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="pc-card space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await createCommunitySpace(orgSlug, {
            name: String(fd.get("name") ?? ""),
            slug: String(fd.get("slug") ?? ""),
            description: String(fd.get("description") ?? ""),
            visibility: "PRIVATE",
          });
          setMsg(res.ok ? "Community created." : res.error);
          if (res.ok) e.currentTarget.reset();
        });
      }}
    >
      <h2 className="pc-section-title">New community space</h2>
      <input name="name" required placeholder="Board workspace" className="pc-input" />
      <input name="slug" required placeholder="board" pattern="[a-z0-9-]+" className="pc-input" />
      <textarea name="description" placeholder="Purpose" className="pc-textarea" rows={2} />
      <button type="submit" className="pc-btn-primary text-sm" disabled={pending}>
        Create space
      </button>
      {msg ? <p className="text-sm text-[var(--pc-text-secondary)]">{msg}</p> : null}
    </form>
  );
}
