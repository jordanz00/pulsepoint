"use client";

import { useState, type ReactNode } from "react";

export function ContactRecordDrawer({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border transition ${
        open ? "border-[var(--pc-brand)]/40 bg-white shadow-sm" : "border-[var(--pc-border)] bg-zinc-50/80"
      }`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`drawer-${id}`}
      >
        <span className="text-sm font-semibold text-zinc-900">{title}</span>
        <span className="text-zinc-400">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div id={`drawer-${id}`} className="border-t border-[var(--pc-border)] px-4 py-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function useDrawerState(initial?: string | null) {
  const [openDrawer, setOpenDrawer] = useState<string | null>(initial ?? null);
  return {
    openDrawer,
    toggle: (id: string) => setOpenDrawer((c) => (c === id ? null : id)),
    isOpen: (id: string) => openDrawer === id,
  };
}
