"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { VideoEmbedPlayer } from "@/components/learn/video-embed-player";
import {
  createLearnVideoItem,
  createLearnVideoPlaylist,
  createVirtualCareerFairEvent,
  createWorkforceProgram,
  enrollInWorkforceProgram,
  setMemberWorkforcePersona,
} from "@/app/actions/learn-workforce";
import { WorkforceVideoShowcase } from "@/components/learn/workforce-video-showcase";
import { walkthroughPageHref } from "@/lib/demo-walkthrough";

type PlaylistItemRow = {
  id: string;
  title: string;
  videoUrl: string;
  durationMin: number;
  ceEligible: boolean;
};

type PlaylistRow = {
  id: string;
  title: string;
  trackSlug: string;
  itemCount: number;
  items: PlaylistItemRow[];
};
type ProgramRow = {
  id: string;
  title: string;
  programType: string;
  status: string;
  enrollmentCount: number;
  eventTitle: string | null;
};
type CareerFairRow = { id: string; title: string; publicSlug: string; status: string };
type MemberOption = { id: string; label: string; workforcePersona: string };

export function LearnWorkforceShell({
  orgSlug,
  playlists,
  programs,
  careerFairs,
  members,
}: {
  orgSlug: string;
  playlists: PlaylistRow[];
  programs: ProgramRow[];
  careerFairs: CareerFairRow[];
  members: MemberOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) setMessage("Saved.");
      else setError(result.error ?? "Something went wrong.");
    });
  }

  return (
    <div className="space-y-6">
      <WorkforceVideoShowcase />

      <section className="glass pp-glass-surface p-5 pp-workforce-demo-panel">
        <header className="pp-demo-panel-head pp-demo-panel-head--inline">
          <div>
            <h2 className="pp-demo-panel-title">Live demo surfaces</h2>
            <p className="pp-demo-panel-sub">
              Portfolio preview — public career fair and member library open in new tabs.
            </p>
          </div>
          <span className="badge-alpha">Alpha</span>
        </header>
        <div className="mt-4 flex flex-wrap gap-3">
          {careerFairs.length > 0 ? (
            <Link
              href={`/${orgSlug}/e/${careerFairs[0]!.publicSlug}`}
              className="pc-btn-primary text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              {careerFairs[0]!.title} →
            </Link>
          ) : null}
          <Link
            href={`/${orgSlug}/learn/library`}
            className="pc-btn-secondary text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Member library
          </Link>
          <Link href={`/${orgSlug}/learn`} className="pc-btn-secondary text-sm">
            Learn home
          </Link>
          <Link href={walkthroughPageHref(orgSlug, 9)} className="pc-btn-secondary text-sm">
            Tour this module
          </Link>
        </div>
        {careerFairs.length > 0 || playlists.length > 0 ? (
          <ul className="pp-workforce-demo-panel__list mt-4">
            {careerFairs.map((f) => (
              <li key={f.id}>
                <strong>{f.title}</strong> · {f.status} ·{" "}
                <Link href={`/${orgSlug}/e/${f.publicSlug}`} className="pc-link">
                  Public booth grid
                </Link>
              </li>
            ))}
            {playlists.map((p) => (
              <li key={p.id}>
                <strong>{p.title}</strong> · {p.trackSlug} · {p.itemCount} videos
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <details className="pp-staff-tools glass pp-glass-surface">
        <summary className="pp-staff-tools__summary">Staff tools — create fairs, playlists, enroll</summary>
        <div className="pp-staff-tools__body space-y-6 p-5 pt-2">

      <section className="p-0">
        <h2 className="pc-section-title">Virtual career fair</h2>
        <form
          className="pp-advocacy-form mt-4 max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() =>
              createVirtualCareerFairEvent(orgSlug, {
                title: String(fd.get("title") ?? ""),
                publicSlug: String(fd.get("publicSlug") ?? ""),
              }),
            );
            e.currentTarget.reset();
          }}
        >
          <label className="mc-field-label">
            Fair title
            <input name="title" required className="mc-input" placeholder="2026 Nursing Career Fair" />
          </label>
          <label className="mc-field-label mt-2">
            Public slug
            <input name="publicSlug" required className="mc-input" placeholder="nursing-career-fair-2026" />
          </label>
          <button type="submit" className="pc-btn-primary mt-3" disabled={pending}>
            Create fair (draft)
          </button>
        </form>
        <ul className="pc-simple-list mt-4">
          {careerFairs.map((f) => (
            <li key={f.id} className="px-5 py-3 flex justify-between gap-2">
              <span>
                {f.title} · <span className="badge-alpha">{f.status}</span>
              </span>
              <Link href={`/${orgSlug}/e/${f.publicSlug}`} className="pc-btn-secondary text-sm">
                Event page
              </Link>
            </li>
          ))}
          {careerFairs.length === 0 ? (
            <li className="px-5 py-3 text-sm text-zinc-500">No career fairs yet.</li>
          ) : null}
        </ul>
      </section>

      <section className="glass pp-glass-surface p-5">
        <h2 className="pc-section-title">Video playlists</h2>
        <form
          className="pp-advocacy-form mt-4 max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() =>
              createLearnVideoPlaylist(orgSlug, {
                title: String(fd.get("title") ?? ""),
                trackSlug: String(fd.get("trackSlug") ?? "nursing"),
              }),
            );
            e.currentTarget.reset();
          }}
        >
          <label className="mc-field-label">
            Playlist title
            <input name="title" required className="mc-input" placeholder="Nursing pipeline intro" />
          </label>
          <label className="mc-field-label mt-2">
            Track
            <select name="trackSlug" className="mc-input" defaultValue="nursing">
              <option value="nursing">Nursing</option>
              <option value="allied-health">Allied health</option>
              <option value="physician">Physician</option>
            </select>
          </label>
          <button type="submit" className="pc-btn-secondary mt-3" disabled={pending}>
            Add playlist
          </button>
        </form>
        <ul className="mt-4 space-y-6">
          {playlists.map((p) => (
            <li key={p.id} className="glass pp-glass-surface p-4">
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <p className="font-medium">
                  {p.title} · {p.trackSlug} · {p.itemCount} items
                </p>
                <Link href={`/${orgSlug}/learn/library`} className="pc-btn-secondary text-sm" target="_blank" rel="noopener noreferrer">
                  Library
                </Link>
              </div>
              {p.items.slice(0, 1).map((item) => (
                <VideoEmbedPlayer key={item.id} videoUrl={item.videoUrl} title={item.title} />
              ))}
            </li>
          ))}
        </ul>
        {playlists.length > 0 ? (
          <form
            className="pp-advocacy-form mt-6 max-w-lg border-t border-[var(--pc-border-subtle)] pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(() =>
                createLearnVideoItem(orgSlug, {
                  playlistId: String(fd.get("playlistId") ?? ""),
                  title: String(fd.get("title") ?? ""),
                  videoUrl: String(fd.get("videoUrl") ?? ""),
                  durationMin: Number(fd.get("durationMin") ?? 0),
                  ceEligible: fd.get("ceEligible") === "on",
                }),
              );
              e.currentTarget.reset();
            }}
          >
            <h3 className="text-sm font-medium mb-2">Add video to playlist</h3>
            <label className="mc-field-label">
              Playlist
              <select name="playlistId" className="mc-input" required>
                {playlists.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="mc-field-label mt-2">
              Title
              <input name="title" required className="mc-input" placeholder="Episode title" />
            </label>
            <label className="mc-field-label mt-2">
              YouTube or Vimeo URL
              <input name="videoUrl" required className="mc-input" placeholder="https://www.youtube.com/watch?v=..." />
            </label>
            <label className="mc-field-label mt-2">
              Duration (minutes)
              <input name="durationMin" type="number" min={0} max={600} className="mc-input" defaultValue={5} />
            </label>
            <label className="mc-field-label mt-2 flex items-center gap-2">
              <input name="ceEligible" type="checkbox" />
              CE-eligible (alpha)
            </label>
            <button type="submit" className="pc-btn-secondary mt-3" disabled={pending}>
              Add video
            </button>
          </form>
        ) : null}
      </section>

      <section className="glass pp-glass-surface p-5">
        <h2 className="pc-section-title">Pipeline programs</h2>
        <form
          className="pp-advocacy-form mt-4 max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() =>
              createWorkforceProgram(orgSlug, {
                title: String(fd.get("title") ?? ""),
                programType: String(fd.get("programType") ?? "pipeline") as "pipeline",
              }),
            );
            e.currentTarget.reset();
          }}
        >
          <label className="mc-field-label">
            Program name
            <input name="title" required className="mc-input" placeholder="Loan forgiveness tracker" />
          </label>
          <label className="mc-field-label mt-2">
            Type
            <select name="programType" className="mc-input" defaultValue="pipeline">
              <option value="pipeline">Pipeline</option>
              <option value="mentorship">Mentorship</option>
              <option value="scholarship">Scholarship</option>
            </select>
          </label>
          <button type="submit" className="pc-btn-secondary mt-3" disabled={pending}>
            Add program
          </button>
        </form>
        <ul className="pc-simple-list mt-4">
          {programs.map((p) => (
            <li key={p.id} className="px-5 py-3 text-sm">
              {p.title} · {p.programType} · {p.enrollmentCount} enrolled
              {p.eventTitle ? ` · ${p.eventTitle}` : ""}
            </li>
          ))}
        </ul>
        {programs.length > 0 && members.length > 0 ? (
          <form
            className="pp-advocacy-form mt-4 max-w-lg"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(() =>
                enrollInWorkforceProgram(orgSlug, {
                  programId: String(fd.get("programId") ?? ""),
                  memberId: String(fd.get("memberId") ?? ""),
                }),
              );
            }}
          >
            <h3 className="text-sm font-medium mb-2">Enroll member in program</h3>
            <div className="pp-advocacy-form-row">
              <select name="programId" className="mc-input" required>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <select name="memberId" className="mc-input" required>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="pc-btn-secondary text-sm mt-2" disabled={pending}>
              Enroll
            </button>
          </form>
        ) : null}
      </section>

      <section className="glass pp-glass-surface p-5">
        <h2 className="pc-section-title">Member workforce persona</h2>
        <form
          className="pp-advocacy-form mt-4 max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() =>
              setMemberWorkforcePersona(orgSlug, {
                memberId: String(fd.get("memberId") ?? ""),
                persona: String(fd.get("persona") ?? "STUDENT") as "STUDENT",
              }),
            );
          }}
        >
          <div className="pp-advocacy-form-row">
            <select name="memberId" className="mc-input" required>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.workforcePersona})
                </option>
              ))}
            </select>
            <select name="persona" className="mc-input" defaultValue="STUDENT">
              <option value="STUDENT">Student</option>
              <option value="NEW_GRAD">New grad</option>
              <option value="CAREER_CHANGER">Career changer</option>
              <option value="EXPERIENCED">Experienced</option>
              <option value="EMPLOYER_PARTNER">Employer partner</option>
            </select>
          </div>
          <button type="submit" className="pc-btn-secondary text-sm mt-2" disabled={pending}>
            Set persona
          </button>
        </form>
      </section>

      {message ? (
        <p className="pp-advocacy-actions-msg pp-advocacy-actions-msg--ok" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="pp-advocacy-actions-msg pp-advocacy-actions-msg--err" role="alert">
          {error}
        </p>
      ) : null}
        </div>
      </details>
    </div>
  );
}
