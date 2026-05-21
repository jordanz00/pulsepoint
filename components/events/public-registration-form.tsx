"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckoutSession } from "@/app/actions/events";

export function PublicRegistrationForm({
  orgSlug,
  eventSlug,
  priceCents,
}: {
  orgSlug: string;
  eventSlug: string;
  priceCents: number;
}) {
  const [message, setMessage] = useState<string | null>(null);
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
      setMessage(data.error ?? "Registration failed");
      return;
    }

    if (data.waitlisted) {
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
      setMessage(!checkout.ok ? checkout.error : "Payment could not start");
      return;
    }

    setMessage(
      data.requiresPayment
        ? "Registered — payment will be collected separately."
        : "You are registered. Check your email for confirmation.",
    );
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-6">
      {message && (
        <p className="rounded bg-teal-50 px-3 py-2 text-sm text-teal-900">{message}</p>
      )}
      <div>
        <Label htmlFor="guestName">Full name</Label>
        <Input id="guestName" name="guestName" required />
      </div>
      <div>
        <Label htmlFor="guestEmail">Email</Label>
        <Input id="guestEmail" name="guestEmail" type="email" required />
      </div>
      {priceCents > 0 && (
        <p className="text-sm text-zinc-600">
          Price: ${(priceCents / 100).toFixed(2)} USD
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Register"}
      </Button>
    </form>
  );
}
