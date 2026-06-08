"use client";

import { useState, useTransition } from "react";
import {
  addEventSession,
  addEventSpeaker,
  addEventSponsor,
} from "@/app/actions/event-conference";
import { updateEventMicrositeBranding } from "@/app/actions/tickets";

type MicrositeConfig = {
  headline?: string;
  accent?: string;
  showSpeakers?: boolean;
  showSponsors?: boolean;
  showSessions?: boolean;
};

type Speaker = {
  id: string;
  name: string;
  title: string;
  role: string;
};
type Sponsor = { id: string; name: string; tier: string; amountCents: number };
type Session = { id: string; title: string; startsAt: Date; room: string; track: string };

export function EventConferencePanel({
  orgSlug,
  eventId,
  speakers,
  sponsors,
  sessions,
  micrositeConfig,
}: {
  orgSlug: string;
  eventId: string;
  speakers: Speaker[];
  sponsors: Sponsor[];
  sessions: Session[];
  micrositeConfig?: MicrositeConfig | null;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const cfg = micrositeConfig ?? {};

  return (
    <div className="space-y-8">
      <section className="pc-card">
        <h2 className="pc-section-title">Microsite branding</h2>
        <p className="pc-section-lead">
          Hero headline, accent color, and which sections appear on the public event page.
        </p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await updateEventMicrositeBranding(orgSlug, eventId, {
                headline: String(fd.get("headline") ?? "") || undefined,
                accent: String(fd.get("accent") ?? "") || undefined,
                showSpeakers: fd.get("showSpeakers") === "on",
                showSponsors: fd.get("showSponsors") === "on",
                showSessions: fd.get("showSessions") === "on",
              });
              setMsg(res.ok ? "Microsite updated." : res.error);
            });
          }}
        >
          <input
            name="headline"
            defaultValue={cfg.headline ?? ""}
            placeholder="Hero headline"
            className="pc-input sm:col-span-2"
          />
          <input
            name="accent"
            type="color"
            defaultValue={cfg.accent ?? "#0ea5e9"}
            className="h-10 w-full cursor-pointer rounded-lg border border-[var(--pc-border)]"
            aria-label="Accent color"
          />
          <label className="flex items-center gap-2 text-sm">
            <input name="showSpeakers" type="checkbox" defaultChecked={cfg.showSpeakers !== false} />
            Show speakers
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="showSponsors" type="checkbox" defaultChecked={cfg.showSponsors !== false} />
            Show sponsors
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input name="showSessions" type="checkbox" defaultChecked={cfg.showSessions !== false} />
            Show agenda
          </label>
          <button type="submit" className="pc-btn-secondary text-sm sm:col-span-2" disabled={pending}>
            Save microsite
          </button>
        </form>
      </section>
      <section className="pc-card">
        <h2 className="pc-section-title">Speakers</h2>
        <p className="pc-section-lead">Keynotes, panels, and faculty — shown on the event microsite.</p>
        <ul className="mt-4 space-y-2">
          {speakers.map((s) => (
            <li key={s.id} className="text-sm">
              <span className="font-medium">{s.name}</span>
              {s.title ? ` · ${s.title}` : ""}
              <span className="ml-2 text-xs text-[var(--pc-accent)]">{s.role}</span>
            </li>
          ))}
          {speakers.length === 0 ? (
            <li className="text-sm text-[var(--pc-text-secondary)]">No speakers yet.</li>
          ) : null}
        </ul>
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await addEventSpeaker(orgSlug, eventId, {
                name: String(fd.get("name") ?? ""),
                title: String(fd.get("title") ?? ""),
                role: "SPEAKER",
              });
              setMsg(res.ok ? "Speaker added." : res.error);
              e.currentTarget.reset();
            });
          }}
        >
          <input name="name" required placeholder="Name" className="pc-input max-w-[180px]" />
          <input name="title" placeholder="Title" className="pc-input max-w-[180px]" />
          <button type="submit" className="pc-btn-secondary text-sm" disabled={pending}>
            Add speaker
          </button>
        </form>
      </section>

      <section className="pc-card">
        <h2 className="pc-section-title">Sponsors</h2>
        <ul className="mt-4 space-y-2">
          {sponsors.map((s) => (
            <li key={s.id} className="text-sm">
              <span className="font-medium">{s.name}</span> · {s.tier}
              {s.amountCents > 0
                ? ` · $${(s.amountCents / 100).toLocaleString()}`
                : ""}
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await addEventSponsor(orgSlug, eventId, {
                name: String(fd.get("name") ?? ""),
                tier: String(fd.get("tier") ?? "Gold"),
              });
              setMsg(res.ok ? "Sponsor added." : res.error);
              e.currentTarget.reset();
            });
          }}
        >
          <input name="name" required placeholder="Sponsor" className="pc-input max-w-[180px]" />
          <input name="tier" placeholder="Tier" className="pc-input max-w-[100px]" />
          <button type="submit" className="pc-btn-secondary text-sm" disabled={pending}>
            Add sponsor
          </button>
        </form>
      </section>

      <section className="pc-card">
        <h2 className="pc-section-title">Sessions</h2>
        <ul className="mt-4 space-y-2">
          {sessions.map((s) => (
            <li key={s.id} className="text-sm">
              <span className="font-medium">{s.title}</span>
              <span className="text-[var(--pc-text-secondary)]">
                {" "}
                · {s.startsAt.toLocaleString()} · {s.room || s.track || "TBD"}
              </span>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 grid gap-2 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await addEventSession(orgSlug, eventId, {
                title: String(fd.get("title") ?? ""),
                startsAt: String(fd.get("startsAt") ?? ""),
                room: String(fd.get("room") ?? ""),
                track: String(fd.get("track") ?? ""),
              });
              setMsg(res.ok ? "Session added." : res.error);
              e.currentTarget.reset();
            });
          }}
        >
          <input name="title" required placeholder="Session title" className="pc-input" />
          <input name="startsAt" type="datetime-local" required className="pc-input" />
          <input name="room" placeholder="Room" className="pc-input" />
          <input name="track" placeholder="Track" className="pc-input" />
          <button type="submit" className="pc-btn-secondary text-sm sm:col-span-2" disabled={pending}>
            Add session
          </button>
        </form>
      </section>

      {msg ? <p className="text-sm text-[var(--pc-text-secondary)]">{msg}</p> : null}
    </div>
  );
}
