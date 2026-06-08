"use client";

import { useState, useTransition } from "react";
import { createCourse, createCreditType, enrollMemberInCourse } from "@/app/actions/learn";

export function LearnQuickAdd({
  orgSlug,
  creditTypes,
  courses = [],
  members = [],
}: {
  orgSlug: string;
  creditTypes: { id: string; code: string; name: string }[];
  courses?: { id: string; title: string }[];
  members?: { id: string; label: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="pc-card"
        action={(form) =>
          startTransition(async () => {
            const r = await createCreditType(orgSlug, {
              code: String(form.get("code") ?? ""),
              name: String(form.get("name") ?? ""),
              description: String(form.get("description") ?? ""),
            });
            setMessage(r.ok ? "Credit type added." : r.error);
          })
        }
      >
        <h3 className="text-sm font-semibold text-[var(--pc-text)]">Add credit type</h3>
        <div className="mt-3 grid gap-2">
          <input name="code" placeholder="Code (e.g. CME)" required className="rounded-md border px-3 py-2 text-sm" />
          <input name="name" placeholder="Name" required className="rounded-md border px-3 py-2 text-sm" />
          <input name="description" placeholder="Description (optional)" className="rounded-md border px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={pending} className="pc-btn-primary mt-3 text-sm">
          {pending ? "Adding…" : "Add credit type"}
        </button>
      </form>

      <form
        className="pc-card"
        action={(form) =>
          startTransition(async () => {
            const ct = String(form.get("creditTypeId") ?? "");
            const r = await createCourse(orgSlug, {
              title: String(form.get("title") ?? ""),
              description: String(form.get("description") ?? ""),
              creditTypeId: ct || undefined,
              creditAmount: Number(form.get("creditAmount") ?? 0),
            });
            setMessage(r.ok ? "Course added." : r.error);
          })
        }
      >
        <h3 className="text-sm font-semibold text-[var(--pc-text)]">Add course</h3>
        <div className="mt-3 grid gap-2">
          <input name="title" placeholder="Title" required className="rounded-md border px-3 py-2 text-sm" />
          <input name="description" placeholder="Description" className="rounded-md border px-3 py-2 text-sm" />
          <select name="creditTypeId" className="rounded-md border px-3 py-2 text-sm">
            <option value="">No credit type</option>
            {creditTypes.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
          <input name="creditAmount" type="number" min={0} placeholder="Credit amount" className="rounded-md border px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={pending} className="pc-btn-primary mt-3 text-sm">
          {pending ? "Adding…" : "Add course"}
        </button>
      </form>

      {courses.length > 0 && members.length > 0 ? (
        <form
          className="pc-card lg:col-span-2"
          action={(form) =>
            startTransition(async () => {
              const r = await enrollMemberInCourse(orgSlug, {
                memberId: String(form.get("memberId") ?? ""),
                courseId: String(form.get("courseId") ?? ""),
              });
              setMessage(r.ok ? "Member enrolled." : r.error);
            })
          }
        >
          <h3 className="text-sm font-semibold text-[var(--pc-text)]">Enroll member in course</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <select name="memberId" required className="rounded-md border px-3 py-2 text-sm">
              <option value="">Select member…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <select name="courseId" required className="rounded-md border px-3 py-2 text-sm">
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={pending} className="pc-btn-primary mt-3 text-sm">
            {pending ? "Enrolling…" : "Enroll"}
          </button>
        </form>
      ) : null}

      {message && (
        <p className="text-xs text-[var(--pc-text-secondary)] lg:col-span-2">{message}</p>
      )}
    </div>
  );
}
