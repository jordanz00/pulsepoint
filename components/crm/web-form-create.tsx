"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWebForm } from "@/app/actions/web-forms";

export function WebFormCreate({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("Event interest");
  const [slug, setSlug] = useState("event-interest");

  return (
    <form
      className="pc-glass-panel flex flex-wrap items-end gap-3 rounded-xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await createWebForm(orgSlug, { name, slug, published: false });
          router.refresh();
        });
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Form name
        <input className="pc-input" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        URL slug
        <input
          className="pc-input font-mono text-xs"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          required
        />
      </label>
      <button type="submit" className="pc-btn-primary text-sm" disabled={pending}>
        {pending ? "Creating…" : "Create form"}
      </button>
    </form>
  );
}
