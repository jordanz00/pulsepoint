"use client";

import { useState } from "react";
import type {
  GraphCalendarEvent,
  GraphContact,
  GraphMailThread,
} from "@/lib/adapters/microsoft365/types";

type Props = {
  orgSlug: string;
  connected: boolean;
  lastSyncAt: string | null;
  initialThreads: GraphMailThread[];
  initialCalendar?: GraphCalendarEvent[];
  initialContacts?: GraphContact[];
};

export function MicrosoftConnectPanel({
  orgSlug,
  connected,
  lastSyncAt,
  initialThreads,
  initialCalendar = [],
  initialContacts = [],
}: Props) {
  const [threads, setThreads] = useState(initialThreads);
  const [calendar, setCalendar] = useState(initialCalendar);
  const [contacts, setContacts] = useState(initialContacts);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"mail" | "calendar" | "contacts">("mail");

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations/microsoft/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setThreads(data.threads ?? []);
      setCalendar(data.calendarEvents ?? []);
      setContacts(data.contacts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="pc-glass-panel rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Microsoft 365</h2>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mail, calendar, and contacts via Microsoft Graph — read-only in pilot v1.
          </p>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">
            Status: {connected ? "Connected" : "Not connected"}
            {lastSyncAt ? ` · Last sync ${new Date(lastSyncAt).toLocaleString()}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {!connected ? (
            <a
              href={`/api/integrations/microsoft/connect?returnTo=/${orgSlug}/enterprise/integrations`}
              className="pc-btn-primary"
            >
              Connect Microsoft 365
            </a>
          ) : (
            <button
              type="button"
              className="pc-btn-secondary"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? "Syncing…" : "Sync all"}
            </button>
          )}
        </div>
      </div>

      {connected ? (
        <div className="mt-4 flex gap-2 border-b border-white/10 pb-2">
          {(["mail", "calendar", "contacts"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`text-sm px-3 py-1 rounded-lg ${tab === t ? "bg-white/10 font-semibold" : "text-[var(--fg-muted)]"}`}
              onClick={() => setTab(t)}
            >
              {t === "mail" ? `Inbox (${threads.length})` : t === "calendar" ? `Calendar (${calendar.length})` : `Contacts (${contacts.length})`}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-[var(--pc-error)]" role="alert">
          {error}
        </p>
      ) : null}

      {connected && tab === "mail" && threads.length > 0 ? (
        <ul className="mt-4 divide-y divide-white/10">
          {threads.map((t) => (
            <li key={t.id} className="py-3">
              <p className="text-sm font-medium">
                {!t.isRead ? <span className="mr-2 text-[var(--pc-brand)]">●</span> : null}
                {t.subject}
              </p>
              <p className="text-xs text-[var(--fg-muted)]">
                {t.from} · {new Date(t.receivedAt).toLocaleString()}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--fg-muted)]">{t.preview}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {connected && tab === "calendar" && calendar.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {calendar.map((e) => (
            <li key={e.id} className="text-sm rounded-lg bg-white/5 px-3 py-2">
              <p className="font-medium">{e.subject}</p>
              <p className="text-xs text-[var(--fg-muted)]">
                {e.start ? new Date(e.start).toLocaleString() : ""}
                {e.location ? ` · ${e.location}` : ""}
                {e.isOnline ? " · Online" : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {connected && tab === "contacts" && contacts.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {contacts.map((c) => (
            <li key={c.id} className="text-sm flex justify-between gap-2">
              <span className="font-medium">{c.displayName}</span>
              <span className="text-[var(--fg-muted)] truncate">{c.email ?? c.company}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {connected && threads.length === 0 && calendar.length === 0 && contacts.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--fg-muted)]">
          No data synced yet. Click Sync all.
        </p>
      ) : null}
    </div>
  );
}
