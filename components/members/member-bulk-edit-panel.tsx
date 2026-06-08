"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import {
  applyMemberBulkEdit,
  previewMemberBulkEdit,
} from "@/app/actions/member-bulk-edit";
import { MEMBER_BULK_EDIT_FIELDS } from "@/lib/crm/bulk-edit-fields";

type PreviewRow = { id: string; name: string; before: string; after: string };

export function MemberBulkEditPanel({
  orgSlug,
  selectedIds,
  onClearSelection,
}: {
  orgSlug: string;
  selectedIds: string[];
  onClearSelection: () => void;
}) {
  const router = useRouter();
  const [field, setField] = useState(MEMBER_BULK_EDIT_FIELDS[0]!.id);
  const [action, setAction] = useState<"remove" | "replace" | "set">("set");
  const [findMode, setFindMode] = useState<"specific" | "all" | "empty">("all");
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [pending, setPending] = useState<"preview" | "apply" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    wouldUpdate: number;
    skipped: number;
    sample: PreviewRow[];
  } | null>(null);

  const fieldMeta = MEMBER_BULK_EDIT_FIELDS.find((f) => f.id === field);
  const canRegex = fieldMeta?.supportsRegex && action === "replace";

  function payload() {
    return {
      memberIds: selectedIds,
      field,
      action,
      findMode,
      findValue: findValue || undefined,
      replaceValue: replaceValue || undefined,
      useRegex: canRegex ? useRegex : false,
    };
  }

  async function runPreview() {
    setPending("preview");
    setError(null);
    setMessage(null);
    const result = await previewMemberBulkEdit(payload(), orgSlug);
    setPending(null);
    if (!result.ok) {
      setError(result.error ?? "Preview failed");
      setPreview(null);
      return;
    }
    setPreview(result.data ?? null);
  }

  async function runApply() {
    if (
      !confirm(
        `Apply bulk edit to ${selectedIds.length} selected member(s)? This cannot be undone in one click.`,
      )
    ) {
      return;
    }
    setPending("apply");
    setError(null);
    setMessage(null);
    const result = await applyMemberBulkEdit(payload(), orgSlug);
    setPending(null);
    if (!result.ok) {
      setError(result.error ?? "Bulk edit failed");
      return;
    }
    setMessage(`Updated ${result.data?.updated ?? 0} member(s). Skipped ${result.data?.skipped ?? 0}.`);
    setPreview(null);
    onClearSelection();
    router.refresh();
  }

  if (selectedIds.length === 0) return null;

  return (
    <div
      className="pc-glass-panel sticky bottom-4 z-20 mt-4 rounded-xl border-2 border-[var(--pc-brand)]/30 p-4 shadow-lg"
      role="region"
      aria-label="Bulk edit selected members"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Bulk edit</h2>
          <p className="text-sm text-zinc-500">
            {selectedIds.length} selected · Nimble-style find &amp; replace for contact fields
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onClearSelection}>
          Clear selection
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          Field
          <select
            value={field}
            onChange={(e) => {
              setField(e.target.value);
              setPreview(null);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2"
          >
            {MEMBER_BULK_EDIT_FIELDS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Action
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value as typeof action);
              setPreview(null);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2"
          >
            <option value="set">Set / add value</option>
            <option value="replace">Replace value</option>
            <option value="remove">Remove / clear</option>
          </select>
        </label>

        <label className="text-sm">
          Match
          <select
            value={findMode}
            onChange={(e) => {
              setFindMode(e.target.value as typeof findMode);
              setPreview(null);
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2"
          >
            <option value="all">All selected</option>
            <option value="specific">Specific value only</option>
            <option value="empty">Empty fields only</option>
          </select>
        </label>

        {fieldMeta?.type === "enum" && action !== "remove" ? (
          <label className="text-sm">
            New value
            <select
              value={replaceValue}
              onChange={(e) => setReplaceValue(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2"
            >
              <option value="">Choose…</option>
              {fieldMeta.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="text-sm">
            {action === "remove" ? "Find value (optional)" : "New / replace value"}
            <input
              value={action === "remove" ? findValue : replaceValue}
              onChange={(e) =>
                action === "remove" ? setFindValue(e.target.value) : setReplaceValue(e.target.value)
              }
              placeholder={action === "set" ? "Value to set" : "New value"}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2"
              disabled={action === "remove" && findMode === "all"}
            />
          </label>
        )}
      </div>

      {findMode === "specific" && action !== "set" ? (
        <label className="mt-3 block text-sm">
          Find value
          <input
            value={findValue}
            onChange={(e) => setFindValue(e.target.value)}
            className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 px-2 py-2"
            placeholder="Value to match"
          />
        </label>
      ) : null}

      {canRegex ? (
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useRegex}
            onChange={(e) => setUseRegex(e.target.checked)}
          />
          Use regular expression (replace only)
        </label>
      ) : null}

      {field === "tags" && action === "set" ? (
        <p className="mt-2 text-xs text-zinc-500">
          Set mode adds a tag if missing. Use Replace to swap one tag for another, or Remove to strip a
          tag from all selected.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={!!pending} onClick={runPreview}>
          {pending === "preview" ? "Previewing…" : "Preview changes"}
        </Button>
        <Button type="button" disabled={!!pending} onClick={runApply}>
          {pending === "apply" ? "Applying…" : "Apply to selected"}
        </Button>
      </div>

      {error ? (
        <div className="mt-3">
          <FormAlert variant="error">{error}</FormAlert>
        </div>
      ) : null}
      {message ? (
        <div className="mt-3">
          <FormAlert variant="success">{message}</FormAlert>
        </div>
      ) : null}

      {preview ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-medium">
            Preview: {preview.wouldUpdate} would update · {preview.skipped} unchanged
          </p>
          {preview.sample.length > 0 ? (
            <table className="mt-2 w-full text-left text-xs">
              <thead>
                <tr>
                  <th className="pr-2">Member</th>
                  <th className="pr-2">Before</th>
                  <th>After</th>
                </tr>
              </thead>
              <tbody>
                {preview.sample.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-200">
                    <td className="py-1 pr-2 font-medium">{row.name}</td>
                    <td className="py-1 pr-2 text-zinc-500">{row.before || "—"}</td>
                    <td className="py-1 text-zinc-800">{row.after || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
