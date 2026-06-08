"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Member360Activity, Member360ActivityKind } from "@/lib/member-360";

const KIND_LABELS: Record<Member360ActivityKind, string> = {
  event: "Events",
  commerce: "Commerce",
  giving: "Giving",
  learn: "Learn",
  email: "Email",
  note: "Notes",
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

export function Member360Timeline({ activities }: { activities: Member360Activity[] }) {
  const [kindFilter, setKindFilter] = useState<Member360ActivityKind | "all">("all");

  const kindsPresent = useMemo(() => {
    const set = new Set(activities.map((a) => a.kind));
    return (Object.keys(KIND_LABELS) as Member360ActivityKind[]).filter((k) =>
      set.has(k),
    );
  }, [activities]);

  const filtered =
    kindFilter === "all"
      ? activities
      : activities.filter((a) => a.kind === kindFilter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={kindFilter === "all"}
          onClick={() => setKindFilter("all")}
          label={`All (${activities.length})`}
        />
        {kindsPresent.map((k) => (
          <FilterChip
            key={k}
            active={kindFilter === k}
            onClick={() => setKindFilter(k)}
            label={KIND_LABELS[k]}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--pc-text-secondary)]">
          No activity in this category.
        </p>
      ) : (
        <ul className="pc-simple-list mt-4">
          {filtered.map((a) => (
            <li key={a.id} className="px-6 py-4">
              <ActivityRow activity={a} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        active
          ? "bg-sky-600 text-white"
          : "border border-[var(--pc-border)] bg-white text-[var(--pc-text-secondary)] hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function ActivityRow({ activity: a }: { activity: Member360Activity }) {
  const title = a.href ? (
    <Link href={a.href} className="pc-link font-medium">
      {a.title}
    </Link>
  ) : (
    <span className="font-medium text-[var(--pc-text)]">{a.title}</span>
  );

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--pc-accent)]">
          {KIND_LABELS[a.kind]}
        </p>
        <p className="mt-0.5">{title}</p>
        <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">{a.detail}</p>
      </div>
      <div className="text-right text-sm text-[var(--pc-text-tertiary)]">
        <p>{a.at.toLocaleDateString()}</p>
        {a.amountCents !== undefined ? (
          <p className="font-medium tabular-nums text-[var(--pc-text)]">
            {formatUsd(a.amountCents)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
