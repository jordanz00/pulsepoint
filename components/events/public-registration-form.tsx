"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { FORM_HELP } from "@/lib/form-help-copy";
import { createCheckoutSession } from "@/app/actions/events";

export function PublicRegistrationForm({
  orgSlug,
  eventSlug,
  priceCents,
  ticketTypes = [],
}: {
  orgSlug: string;
  eventSlug: string;
  priceCents: number;
  ticketTypes?: { id: string; name: string; priceCents: number }[];
}) {
  const [ticketTypeId, setTicketTypeId] = useState(ticketTypes[0]?.id ?? "");
  const selected = ticketTypes.find((t) => t.id === ticketTypeId);
  const displayPrice = selected?.priceCents ?? priceCents;
  const [message, setMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<"success" | "error" | "info">("info");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const res = await fetch("/api/public/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgSlug,
        eventSlug,
        guestName: fd.get("guestName"),
        guestEmail: fd.get("guestEmail"),
        ticketTypeId: ticketTypeId || undefined,
        promoCode: String(fd.get("promoCode") ?? "").trim() || undefined,
      }),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      waitlisted?: boolean;
      registrationId?: string;
      requiresPayment?: boolean;
      checkoutAvailable?: boolean;
    };

    setPending(false);

    if (!res.ok || !data.ok) {
      setMessageVariant("error");
      setMessage(data.error ?? "Registration failed. Please check your details and try again.");
      return;
    }

    if (data.waitlisted) {
      setMessageVariant("success");
      setMessage("You have been added to the waitlist.");
      return;
    }

    if (data.requiresPayment && data.registrationId && data.checkoutAvailable) {
      const checkout = await createCheckoutSession(
        orgSlug,
        eventSlug,
        data.registrationId,
      );
      if (checkout.ok && checkout.data?.url) {
        window.location.href = checkout.data.url;
        return;
      }
      setMessageVariant("error");
      setMessage(!checkout.ok ? checkout.error : "Payment could not start. Please contact the association.");
      return;
    }

    setMessageVariant("success");
    setMessage(
      data.requiresPayment
        ? "You are registered. Payment will be collected separately."
        : "You are registered. Check your email for confirmation.",
    );
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="pc-form-shell">
      {message ? <FormAlert variant={messageVariant}>{message}</FormAlert> : null}
      <FormField id="guestName" label="Full name" help={FORM_HELP.registration.guestName} required>
        <Input name="guestName" required autoComplete="name" />
      </FormField>
      <FormField id="guestEmail" label="Email" help={FORM_HELP.registration.guestEmail} required>
        <Input name="guestEmail" type="email" required autoComplete="email" />
      </FormField>
      {ticketTypes.length > 0 ? (
        <FormField id="ticketType" label="Ticket type" required>
          <select
            name="ticketType"
            className="pc-input w-full"
            value={ticketTypeId}
            onChange={(e) => setTicketTypeId(e.target.value)}
          >
            {ticketTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — ${(t.priceCents / 100).toFixed(2)}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}
      <FormField id="promoCode" label="Promo code (optional)">
        <Input name="promoCode" autoComplete="off" placeholder="e.g. EARLYBIRD" />
      </FormField>
      {displayPrice > 0 ? (
        <p className="text-sm text-[var(--fg-muted)]">
          Price: ${(displayPrice / 100).toFixed(2)} USD
        </p>
      ) : null}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Submitting…" : "Register"}
      </Button>
    </form>
  );
}
