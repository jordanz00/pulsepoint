/**
 * Nimble-style bulk member edits — find/replace/remove/set across selected contacts.
 */

import type { Member } from "@/app/generated/prisma/client";
import { memberTagsArray } from "@/lib/member-tags";
import { getBulkField } from "@/lib/crm/bulk-edit-fields";
import type { MemberBulkEditInput } from "@/lib/validations/member-bulk-edit";

export type BulkEditPreview = {
  wouldUpdate: number;
  skipped: number;
  sample: Array<{ id: string; name: string; before: string; after: string }>;
};

function fullName(m: Member): string {
  return `${m.firstName} ${m.lastName}`;
}

function readFieldValue(member: Member, fieldId: string): string {
  const field = getBulkField(fieldId);
  if (!field) return "";

  if (field.type === "tags") {
    return memberTagsArray(member.tags).join(", ");
  }
  if (field.type === "custom") {
    const key = field.path.replace("customFields.", "");
    const cf = member.customFields as Record<string, unknown> | null;
    const v = cf?.[key];
    return v == null ? "" : String(v);
  }
  if (field.type === "datetime") {
    const v = member.nextFollowUpAt;
    return v ? v.toISOString() : "";
  }

  const col = field.path as keyof Member;
  const v = member[col];
  return v == null ? "" : String(v);
}

function matchesFind(
  current: string,
  input: MemberBulkEditInput,
): boolean {
  if (input.findMode === "all") return true;
  if (input.findMode === "empty") return current.trim() === "";

  const find = input.findValue ?? "";
  if (input.useRegex && input.action === "replace") {
    try {
      const re = new RegExp(find, "i");
      return re.test(current);
    } catch {
      return false;
    }
  }
  return current.toLowerCase() === find.toLowerCase();
}

function applyTextTransform(
  current: string,
  input: MemberBulkEditInput,
): string | null {
  if (input.action === "remove") return null;

  const next = input.replaceValue ?? "";
  if (input.action === "set") {
    if (input.findMode === "empty" && current.trim() !== "") return current;
    if (input.findMode === "specific" && !matchesFind(current, input)) return current;
    return next;
  }

  // replace
  if (!matchesFind(current, input)) return current;
  if (input.useRegex && input.findValue) {
    try {
      const re = new RegExp(input.findValue, "gi");
      return current.replace(re, next);
    } catch {
      return current;
    }
  }
  return next;
}

function applyTags(current: string[], input: MemberBulkEditInput): string[] {
  const find = (input.findValue ?? "").trim();
  const repl = (input.replaceValue ?? "").trim();

  if (input.action === "remove") {
    if (input.findMode === "all") return [];
    if (!find) return current;
    return current.filter((t) => t.toLowerCase() !== find.toLowerCase());
  }

  if (input.action === "set") {
    if (input.findMode === "all") return repl ? [repl] : current;
    if (input.findMode === "empty" && current.length === 0) return repl ? [repl] : current;
    if (repl && !current.some((t) => t.toLowerCase() === repl.toLowerCase())) {
      return [...current, repl];
    }
    return current;
  }

  // replace
  if (input.findMode === "all") return repl ? [repl] : current;
  return current.map((t) =>
    find && t.toLowerCase() === find.toLowerCase() ? repl || t : t,
  );
}

export function computeMemberBulkUpdate(
  member: Member,
  input: MemberBulkEditInput,
): { data: Record<string, unknown> | null; changed: boolean; before: string; after: string } {
  const field = getBulkField(input.field);
  if (!field) {
    return { data: null, changed: false, before: "", after: "" };
  }

  const before = readFieldValue(member, input.field);

  if (field.type === "tags") {
    const tags = memberTagsArray(member.tags);
    const nextTags = applyTags(tags, input);
    const after = nextTags.join(", ");
    const changed = JSON.stringify(tags) !== JSON.stringify(nextTags);
    return {
      changed,
      before,
      after,
      data: changed ? { tags: nextTags } : null,
    };
  }

  if (field.type === "custom") {
    const key = field.path.replace("customFields.", "");
    const cf = { ...(member.customFields as Record<string, unknown>) };
    const current = cf[key] == null ? "" : String(cf[key]);
    let next: string | null;

    if (input.action === "remove") {
      next = matchesFind(current, input) ? null : current;
    } else {
      const transformed = applyTextTransform(current, input);
      next = transformed;
    }

    const after = next ?? "";
    const changed = String(current) !== String(after);
    if (!changed) return { data: null, changed: false, before, after: before };

    if (next === null || next === "") {
      delete cf[key];
    } else {
      cf[key] = next;
    }
    return { data: { customFields: cf }, changed: true, before, after };
  }

  if (field.type === "datetime") {
    let next: Date | null = member.nextFollowUpAt;
    if (input.action === "remove") {
      if (matchesFind(before, input)) next = null;
    } else if (input.replaceValue) {
      if (matchesFind(before, input) || input.findMode === "all") {
        next = new Date(input.replaceValue);
      }
    }
    const after = next ? next.toISOString() : "";
    const changed =
      (member.nextFollowUpAt?.toISOString() ?? "") !== (next?.toISOString() ?? "");
    return {
      data: changed ? { nextFollowUpAt: next } : null,
      changed,
      before,
      after,
    };
  }

  if (field.type === "enum") {
    const current = before;
    let next = current;
    if (input.action === "remove") {
      return { data: null, changed: false, before, after: before };
    }
    if (input.action === "set" || input.action === "replace") {
      if (matchesFind(current, input) || input.findMode === "all") {
        next = input.replaceValue ?? current;
      }
    }
    const changed = current !== next;
    return {
      data: changed ? { [field.path]: next } : null,
      changed,
      before,
      after: next,
    };
  }

  // text
  const current = before;
  let next: string | null;
  if (input.action === "remove") {
    if (input.findMode === "all") {
      next = null;
    } else if (matchesFind(current, input)) {
      next = null;
    } else {
      next = current;
    }
  } else {
    next = applyTextTransform(current, input);
  }
  const after = next ?? "";
  const changed = current !== after;
  return {
    data: changed ? { [field.path]: next } : null,
    changed,
    before,
    after,
  };
}

export function previewBulkEdit(
  members: Member[],
  input: MemberBulkEditInput,
): BulkEditPreview {
  let wouldUpdate = 0;
  let skipped = 0;
  const sample: BulkEditPreview["sample"] = [];

  for (const m of members) {
    const result = computeMemberBulkUpdate(m, input);
    if (result.changed) {
      wouldUpdate += 1;
      if (sample.length < 5) {
        sample.push({
          id: m.id,
          name: fullName(m),
          before: result.before,
          after: result.after,
        });
      }
    } else {
      skipped += 1;
    }
  }

  return { wouldUpdate, skipped, sample };
}
