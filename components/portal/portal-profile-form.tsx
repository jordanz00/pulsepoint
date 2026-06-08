"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { FORM_HELP } from "@/lib/form-help-copy";
import { updatePortalProfile } from "@/app/actions/portal";

export function PortalProfileForm({
  orgSlug,
  initial,
}: {
  orgSlug: string;
  initial: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);
    const result = await updatePortalProfile(orgSlug, {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    });
    setPending(false);
    setMessageVariant(result.ok ? "success" : "error");
    setMessage(result.ok ? "Your profile was updated." : result.error);
  }

  return (
    <form action={onSubmit} className="pc-form-shell">
      {message ? <FormAlert variant={messageVariant}>{message}</FormAlert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="firstName" label="First name" help={FORM_HELP.member.firstName} required>
          <Input name="firstName" required defaultValue={initial.firstName} autoComplete="given-name" />
        </FormField>
        <FormField id="lastName" label="Last name" help={FORM_HELP.member.lastName} required>
          <Input name="lastName" required defaultValue={initial.lastName} autoComplete="family-name" />
        </FormField>
      </div>
      <FormField id="email" label="Email" help={FORM_HELP.member.email}>
        <Input
          name="email"
          type="email"
          defaultValue={initial.email ?? ""}
          autoComplete="email"
        />
      </FormField>
      <FormField id="phone" label="Phone" help={FORM_HELP.member.phone}>
        <Input name="phone" type="tel" defaultValue={initial.phone ?? ""} autoComplete="tel" />
      </FormField>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
