"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishWebForm } from "@/app/actions/web-forms";

export function WebFormRowActions({
  orgSlug,
  formId,
  published,
  publicPath,
}: {
  orgSlug: string;
  formId: string;
  published: boolean;
  publicPath: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={publicPath} className="text-sm text-[var(--pc-brand)] hover:underline" target="_blank" rel="noreferrer">
        Public page
      </a>
      <button
        type="button"
        className="text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await publishWebForm(orgSlug, formId, !published);
            router.refresh();
          })
        }
      >
        {published ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
