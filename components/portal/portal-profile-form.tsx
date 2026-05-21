"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  async function onSubmit(formData: FormData) {
    const result = await updatePortalProfile(orgSlug, {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    });
    setMessage(result.ok ? "Profile saved" : result.error);
  }

  return (
    <form action={onSubmit} className="max-w-md space-y-4 rounded-xl border bg-white p-6">
      {message && <p className="text-sm text-teal-800">{message}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required defaultValue={initial.firstName} />
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" required defaultValue={initial.lastName} />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={initial.email ?? ""} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={initial.phone ?? ""} />
      </div>
      <Button type="submit">Save profile</Button>
    </form>
  );
}
