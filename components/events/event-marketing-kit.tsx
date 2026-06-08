"use client";

import { useState } from "react";
import type { EventMarketingPack } from "@/lib/event-marketing-copy";

function CopyBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="ec-copy-block">
      <div className="ec-copy-head">
        <span className="ec-copy-label">{label}</span>
        <button type="button" className="pc-btn-secondary text-xs" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="ec-copy-text">{text}</p>
    </div>
  );
}

export function EventMarketingKit({
  pack,
  registrationUrl,
  heroImageUrl,
}: {
  pack: EventMarketingPack;
  registrationUrl: string;
  heroImageUrl?: string | null;
}) {
  return (
    <section className="ec-panel glass pp-readable-on-light" id="eventcore-marketing">
      <h2 className="ec-panel-title">Marketing kit</h2>
      <p className="ec-panel-lead">
        Copy-ready subjects and posts from your event details. Share the registration
        link:{" "}
        <a href={registrationUrl} className="pc-link" target="_blank" rel="noopener noreferrer">
          {registrationUrl}
        </a>
      </p>

      <div className="ec-poster-preview" aria-hidden={false}>
        <div
          className="ec-poster-card"
          style={
            heroImageUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.55), rgba(15,23,42,0.85)), url(${heroImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <p className="ec-poster-eyebrow">Event</p>
          <h3 className="ec-poster-headline">{pack.posterHeadline}</h3>
          <p className="ec-poster-sub">{pack.posterSubhead}</p>
          <p className="ec-poster-cta">Register →</p>
        </div>
        <p className="ec-poster-hint text-sm text-[var(--readable-on-light-muted)]">
          Poster preview for comms—screenshot or rebuild in Canva. Set hero image in
          Conference / microsite branding.
        </p>
      </div>

      <div className="ec-copy-grid">
        {pack.emailSubjects.map((s, i) => (
          <CopyBlock key={`sub-${i}`} label={`Email subject ${i + 1}`} text={s} />
        ))}
        {pack.socialPosts.map((s, i) => (
          <CopyBlock key={`soc-${i}`} label={`Social post ${i + 1}`} text={s} />
        ))}
        <CopyBlock label="Newsletter blurb" text={pack.newsletterBlurb} />
      </div>
    </section>
  );
}
