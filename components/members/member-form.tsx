"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMember, updateMember } from "@/app/actions/members";

type Props = {
  orgSlug: string;
  memberId?: string;
  initial?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    status?: "ACTIVE" | "INACTIVE" | "LAPSED";
    tags?: string[];
  };
};

export function MemberForm({ orgSlug, memberId, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      status: String(formData.get("status") ?? "ACTIVE") as
        | "ACTIVE"
        | "INACTIVE"
        | "LAPSED",
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const result = memberId
      ? await updateMember(memberId, payload, orgSlug)
      : await createMember(payload, orgSlug);

    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/${orgSlug}/members`);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="max-w-lg space-y-4 rounded-xl border bg-white p-6">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required defaultValue={initial?.firstName} />
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" required defaultValue={initial?.lastName} />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={initial?.email ?? ""} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={initial?.status ?? "ACTIVE"}
          className="min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="LAPSED">Lapsed</option>
        </select>
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={initial?.tags?.join(", ") ?? ""}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : memberId ? "Update member" : "Create member"}
      </Button>
    </form>
  );
}
