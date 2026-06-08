"use client";

/**
 * Member roles panel — add/edit leadership, C-suite, and external board affiliations.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createMemberRole,
  deleteMemberRole,
  updateMemberRole,
} from "@/app/actions/member-roles";
import {
  EXECUTIVE_TITLE_SUGGESTIONS,
  formatMemberRoleLine,
  LEADERSHIP_LEVEL_LABELS,
  ROLE_CATEGORY_LABELS,
  ROLE_SCOPE_LABELS,
  type MemberRoleRow,
} from "@/lib/member-roles";
import type {
  LeadershipLevel,
  MemberRoleCategory,
  MemberRoleScope,
} from "@/app/generated/prisma/client";

type Props = {
  orgSlug: string;
  memberId: string;
  initialRoles: MemberRoleRow[];
};

const CATEGORIES = Object.keys(ROLE_CATEGORY_LABELS) as MemberRoleCategory[];
const SCOPES = Object.keys(ROLE_SCOPE_LABELS) as MemberRoleScope[];
const LEVELS = Object.keys(LEADERSHIP_LEVEL_LABELS) as LeadershipLevel[];

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function MemberRolesPanel({ orgSlug, memberId, initialRoles }: Props) {
  const router = useRouter();
  const [roles, setRoles] = useState(initialRoles);

  useEffect(() => {
    setRoles(initialRoles);
  }, [initialRoles]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refresh() {
    router.refresh();
  }

  async function onAdd(formData: FormData) {
    setPending(true);
    setError(null);
    const payload = formPayload(formData);
    const result = await createMemberRole(memberId, payload, orgSlug);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditingId(null);
    await refresh();
  }

  async function onUpdate(roleId: string, formData: FormData) {
    setPending(true);
    setError(null);
    const result = await updateMemberRole(roleId, formPayload(formData), orgSlug);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditingId(null);
    await refresh();
  }

  async function onDelete(roleId: string) {
    if (!confirm("Remove this role record?")) return;
    setPending(true);
    const result = await deleteMemberRole(roleId, orgSlug);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    await refresh();
  }

  return (
    <section className="pc-glass-panel rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[var(--pc-text)]">
        Leadership &amp; roles
      </h2>
      <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
        Track C-suite level, board seats (this association or other nonprofits), committees, and other governance roles.
      </p>

      {error && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <ul className="mt-4 space-y-3">
        {roles.length === 0 && (
          <li className="text-sm text-[var(--pc-text-tertiary)]">No roles recorded yet.</li>
        )}
        {roles.map((role) => (
          <li
            key={role.id}
            className="rounded-lg border border-[var(--pc-border)] p-4"
          >
            {editingId === role.id ? (
              <RoleForm
                submitLabel="Save role"
                defaultValues={role}
                onSubmit={(fd) => onUpdate(role.id, fd)}
                pending={pending}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-[var(--pc-text)]">
                    {formatMemberRoleLine(role)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--pc-text-tertiary)]">
                    {ROLE_CATEGORY_LABELS[role.category]}
                    {role.leadershipLevel === "C_SUITE" && (
                      <span className="ml-2 inline-block">
                        <Badge variant="live">C-Suite</Badge>
                      </span>
                    )}
                    {role.category === "BOARD" &&
                      role.scope === "THIS_ASSOCIATION" && (
                        <span className="ml-2 inline-block">
                          <Badge variant="live">Our board</Badge>
                        </span>
                      )}
                    {role.category === "BOARD" &&
                      role.scope === "EXTERNAL_ORGANIZATION" && (
                        <span className="ml-2 inline-block">
                          <Badge variant="roadmap">External board</Badge>
                        </span>
                      )}
                  </p>
                  {role.notes && (
                    <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
                      {role.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs"
                    onClick={() => setEditingId(role.id)}
                    disabled={pending}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs text-red-700"
                    onClick={() => onDelete(role.id)}
                    disabled={pending}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-[var(--pc-border)] pt-6">
        <h3 className="text-sm font-semibold text-[var(--pc-text)]">Add role</h3>
        <RoleForm
          submitLabel="Add role"
          onSubmit={onAdd}
          pending={pending}
        />
      </div>
    </section>
  );
}

function formPayload(formData: FormData) {
  return {
    category: String(formData.get("category")),
    scope: String(formData.get("scope")),
    leadershipLevel: String(formData.get("leadershipLevel") || "") || null,
    title: String(formData.get("title") ?? ""),
    organizationName: String(formData.get("organizationName") ?? ""),
    isCurrent: formData.get("isCurrent") === "on",
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

function RoleForm({
  submitLabel,
  defaultValues,
  onSubmit,
  pending,
  onCancel,
}: {
  submitLabel: string;
  defaultValues?: MemberRoleRow;
  onSubmit: (formData: FormData) => void;
  pending: boolean;
  onCancel?: () => void;
}) {
  const [scope, setScope] = useState<MemberRoleScope>(
    defaultValues?.scope ?? "THIS_ASSOCIATION",
  );

  return (
    <form action={onSubmit} className="mt-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Role type</Label>
          <select
            id="category"
            name="category"
            defaultValue={defaultValues?.category ?? "EXECUTIVE"}
            className="min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {ROLE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="scope">Organization</Label>
          <select
            id="scope"
            name="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as MemberRoleScope)}
            className="min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {ROLE_SCOPE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="leadershipLevel">Seniority (optional)</Label>
          <select
            id="leadershipLevel"
            name="leadershipLevel"
            defaultValue={defaultValues?.leadershipLevel ?? ""}
            className="min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
          >
            <option value="">— Not set —</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEADERSHIP_LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            list="member-role-title-suggestions"
            placeholder="CEO, Board Chair, Trustee…"
            defaultValue={defaultValues?.title ?? ""}
          />
          <datalist id="member-role-title-suggestions">
            {EXECUTIVE_TITLE_SUGGESTIONS.map((title) => (
              <option key={title} value={title} />
            ))}
          </datalist>
        </div>
      </div>
      {scope === "EXTERNAL_ORGANIZATION" && (
        <div>
          <Label htmlFor="organizationName">External organization name</Label>
          <Input
            id="organizationName"
            name="organizationName"
            required
            placeholder="State Hospital Association, AHA, etc."
            defaultValue={defaultValues?.organizationName ?? ""}
          />
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="startDate">Start (optional)</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateInput(defaultValues?.startDate ?? null)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End (optional)</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={toDateInput(defaultValues?.endDate ?? null)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="e.g. term limits, committee assignment"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isCurrent"
          defaultChecked={defaultValues?.isCurrent ?? true}
          className="h-4 w-4"
        />
        Current role
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
