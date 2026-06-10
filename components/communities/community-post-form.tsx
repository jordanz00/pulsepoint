"use client";

import { useState, useTransition } from "react";
import { createCommunityPost } from "@/app/actions/communities";

export function CommunityPostForm({
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
          const res = await createCommunityPost(orgSlug, spaceId, {
            title: String(fd.get("title") ?? ""),
            body: String(fd.get("body") ?? ""),
          });
          setMsg(res.ok ? "Post published." : res.error);
          if (res.ok) e.currentTarget.reset();
        });
      }}
    >
      <h3 className="pc-section-title text-base">New discussion post</h3>
      <p className="text-xs text-[var(--pc-text-secondary)]">
        Staff announcements and committee updates appear in the member portal for this space.
      </p>
      <input name="title" required maxLength={200} placeholder="Subject" className="pc-input" />
      <textarea
        name="body"
        required
        maxLength={5000}
        rows={4}
        placeholder="Message"
        className="pc-input min-h-[6rem] resize-y"
      />
      <button type="submit" className="pc-btn-primary text-sm" disabled={pending}>
        {pending ? "Publishing…" : "Publish post"}
      </button>
      {msg ? <p className="text-sm text-[var(--pc-text-secondary)]">{msg}</p> : null}
    </form>
  );
}
