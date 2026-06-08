"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FORM_HELP } from "@/lib/form-help-copy";
import { createEvent, updateEvent } from "@/app/actions/events";
import { getEventPublishReadiness } from "@/lib/events/publish-readiness";

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
    venueName?: string;
    format?: "IN_PERSON" | "VIRTUAL" | "HYBRID";
  };
};

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function EventForm({ orgSlug, eventId, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(eventId);

  async function onSubmit(formData: FormData, publishNow: boolean) {
    setPending(true);
    setError(null);
    const title = String(formData.get("title") ?? "");
    const startsAt = String(formData.get("startsAt") ?? "");
    const publicSlug = String(formData.get("publicSlug") ?? "");
    const desiredStatus = publishNow
      ? "PUBLISHED"
      : (String(formData.get("status") ?? "DRAFT") as
          | "DRAFT"
          | "PUBLISHED"
          | "CANCELLED"
          | "COMPLETED");

    if (publishNow) {
      const readiness = getEventPublishReadiness({
        title,
        startsAt: new Date(startsAt),
        publicSlug,
      });
      if (!readiness.ready) {
        setPending(false);
        setError(readiness.blockers[0] ?? "Complete required fields before publishing.");
        return;
      }
    }

    const payload = {
      title,
      description: String(formData.get("description") ?? ""),
      startsAt,
      endsAt: String(formData.get("endsAt") ?? "") || null,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      priceCents: Math.round(Number(formData.get("priceDollars") ?? 0) * 100),
      status: isEdit ? desiredStatus : publishNow ? "PUBLISHED" : "DRAFT",
      publicSlug,
      venueName: String(formData.get("venueName") ?? ""),
      format: String(formData.get("format") ?? "IN_PERSON") as
        | "IN_PERSON"
        | "VIRTUAL"
        | "HYBRID",
    };

    const result = eventId
      ? await updateEvent(eventId, payload, orgSlug)
      : await createEvent(payload, orgSlug);

    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save event");
      return;
    }

    if (eventId) {
      router.refresh();
      return;
    }

    const id = result.data?.eventId;
    if (!id) {
      router.push(`/${orgSlug}/events`);
      return;
    }
    const query = publishNow ? "?published=1" : "";
    router.push(`/${orgSlug}/events/${id}${query}`);
    router.refresh();
  }

  return (
    <section className="ec-panel glass pp-readable-on-light">
      <h2 className="ec-panel-title">{eventId ? "Event settings" : "New event"}</h2>
      <p className="ec-panel-lead">
        {eventId
          ? "Update title, schedule, capacity, and pricing. Use Overview to publish when you are ready."
          : "Step 1: name and date. Step 2: save as draft or publish. Step 3: copy the registration link from Overview."}
      </p>
      <form
        className="ec-form-grid pc-form-shell pc-form-shell--wide"
        onSubmit={(e) => {
          e.preventDefault();
          const publishNow =
            (e.nativeEvent as SubmitEvent).submitter?.getAttribute("data-publish") === "1";
          void onSubmit(new FormData(e.currentTarget), publishNow);
        }}
      >
        {error ? <FormAlert variant="error">{error}</FormAlert> : null}
        <FormField id="title" label="Title" help={FORM_HELP.event.title} required>
          <Input
            name="title"
            required
            defaultValue={initial?.title}
            onChange={(e) => {
              if (isEdit) return;
              const slugInput = document.querySelector<HTMLInputElement>('input[name="publicSlug"]');
              if (slugInput && !slugInput.dataset.touched) {
                slugInput.value = slugFromTitle(e.target.value);
              }
            }}
          />
        </FormField>
        <FormField id="description" label="Description" help={FORM_HELP.event.description}>
          <Textarea name="description" rows={4} defaultValue={initial?.description ?? ""} />
        </FormField>
        <FormField id="publicSlug" label="Public URL slug" help={FORM_HELP.event.publicSlug} required>
          <Input
            name="publicSlug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            defaultValue={initial?.publicSlug}
            onInput={(e) => {
              (e.target as HTMLInputElement).dataset.touched = "1";
            }}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="startsAt" label="Starts" help={FORM_HELP.event.startsAt} required>
            <Input
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={initial?.startsAt}
            />
          </FormField>
          <FormField id="endsAt" label="Ends (optional)" help={FORM_HELP.event.endsAt}>
            <Input name="endsAt" type="datetime-local" defaultValue={initial?.endsAt ?? ""} />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="venueName" label="Venue">
            <Input name="venueName" defaultValue={initial?.venueName ?? ""} />
          </FormField>
          <FormField id="format" label="Format">
            <Select name="format" defaultValue={initial?.format ?? "IN_PERSON"}>
              <option value="IN_PERSON">In person</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="HYBRID">Hybrid</option>
            </Select>
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="capacity" label="Capacity" help={FORM_HELP.event.capacity}>
            <Input
              name="capacity"
              type="number"
              min={1}
              defaultValue={initial?.capacity ?? ""}
            />
          </FormField>
          <FormField id="priceDollars" label="Price (USD)" help={FORM_HELP.event.priceDollars}>
            <Input
              name="priceDollars"
              type="number"
              min={0}
              step="0.01"
              defaultValue={
                initial?.priceCents != null ? (initial.priceCents / 100).toFixed(2) : "0"
              }
            />
          </FormField>
          {isEdit ? (
            <FormField id="status" label="Status" help={FORM_HELP.event.status}>
              <Select name="status" defaultValue={initial?.status ?? "DRAFT"}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </FormField>
          ) : null}
        </div>
        <div className="ec-action-row">
          {isEdit ? (
            <Button type="submit" variant="primary" disabled={pending} data-publish="0">
              {pending ? "Saving…" : "Save settings"}
            </Button>
          ) : (
            <>
              <Button type="submit" variant="secondary" disabled={pending} data-publish="0">
                {pending ? "Saving…" : "Save as draft"}
              </Button>
              <Button type="submit" variant="primary" disabled={pending} data-publish="1">
                {pending ? "Publishing…" : "Create & publish"}
              </Button>
            </>
          )}
        </div>
      </form>
    </section>
  );
}
