"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDeal } from "@/app/actions/deals";

export function CreateDealForm({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("5000");

  return (
    <form
      className="pc-glass-panel mb-6 flex flex-wrap items-end gap-3 rounded-xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await createDeal(orgSlug, {
            title,
            amountCents: Math.round(parseFloat(amount || "0") * 100),
            stage: "LEAD",
          });
          if (res.ok) {
            setTitle("");
            router.refresh();
          }
        });
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Partnership name
        <input
          className="pc-input min-w-[14rem]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Amount (USD)
        <input
          className="pc-input w-28"
          type="number"
          min={0}
          step={100}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <button type="submit" className="pc-btn-primary text-sm" disabled={pending}>
        {pending ? "Adding…" : "Add opportunity"}
      </button>
    </form>
  );
}
