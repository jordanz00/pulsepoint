"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEvent, updateEvent } from "@/app/actions/events";

type Props = {
  orgSlug: string;
  eventId?: string;
  initial?: {
    title: string;
    description?: string;
    startsAt: string;
    endsAt?: string;
    capacity?: number;
    priceCents?: number;
    status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
    publicSlug: string;
  };
};

export function EventForm({ orgSlug, eventId, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      startsAt: String(formData.get("startsAt") ?? ""),
      endsAt: String(formData.get("endsAt") ?? "") || null,
      capacity: formData.get("capacity")
        ? Number(formData.get("capacity"))
        : null,
      priceCents: Math.round(Number(formData.get("priceDollars") ?? 0) * 100),
      status: String(formData.get("status") ?? "DRAFT") as
        | "DRAFT"
        | "PUBLISHED"
        | "CANCELLED"
        | "COMPLETED",
      publicSlug: String(formData.get("publicSlug") ?? ""),
    };

    const result = eventId
      ? await updateEvent(eventId, payload)
      : await createEvent(payload);

    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/${orgSlug}/events`);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="max-w-xl space-y-4 rounded-xl border bg-white p-6">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ""}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="publicSlug">Public URL slug</Label>
        <Input
          id="publicSlug"
          name="publicSlug"
          required
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          defaultValue={initial?.publicSlug}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="startsAt">Starts</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={initial?.startsAt}
          />
        </div>
        <div>
          <Label htmlFor="endsAt">Ends (optional)</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={initial?.endsAt ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={initial?.capacity ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="priceDollars">Price (USD)</Label>
          <Input
            id="priceDollars"
            name="priceDollars"
            type="number"
            min={0}
            step="0.01"
            defaultValue={
              initial?.priceCents != null ? (initial.priceCents / 100).toFixed(2) : "0"
            }
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "DRAFT"}
            className="min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : eventId ? "Update event" : "Create event"}
      </Button>
    </form>
  );
}
