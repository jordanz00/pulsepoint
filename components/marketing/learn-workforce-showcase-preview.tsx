"use client";

import Link from "next/link";
import { useState } from "react";
import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";
import { MARKETING_CAREER_FAIR_PREVIEW } from "@/lib/marketing-career-fair-preview";
import {
  WORKFORCE_SHOWCASE_VIDEOS,
  workforceEmbedUrl,
} from "@/lib/learn/workforce-showcase-videos";

type PreviewTab = "fair" | "video";

export function LearnWorkforceShowcasePreview() {
  const [tab, setTab] = useState<PreviewTab>("fair");
  const video = WORKFORCE_SHOWCASE_VIDEOS[0]!;
  const fair = MARKETING_CAREER_FAIR_PREVIEW;
  const fairHref = `/${DEMO_ORG_SLUG}/e/${fair.publicSlug}`;

  return (
    <div className="pp-lw-preview mk-liquid-glass">
      <div className="pp-lw-preview-tabs" role="tablist" aria-label="Workforce preview">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "fair"}
          className={`pp-lw-preview-tab${tab === "fair" ? " is-active" : ""}`}
          onClick={() => setTab("fair")}
        >
          Career fair
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "video"}
          className={`pp-lw-preview-tab${tab === "video" ? " is-active" : ""}`}
          onClick={() => setTab("video")}
        >
          CE video
        </button>
      </div>

      {tab === "fair" ? (
        <div className="pp-lw-preview-fair" role="tabpanel">
          <header className="pp-lw-preview-fair-head">
            <span className="badge-alpha">Alpha</span>
            <p className="pp-lw-preview-fair-title">{fair.eventTitle}</p>
          </header>
          <div className="pp-lw-preview-booth-grid" role="list">
            {fair.booths.map((booth) => (
              <article key={booth.id} className="pp-lw-preview-booth" role="listitem">
                <span className="pp-lw-preview-booth-num">{booth.boothNumber}</span>
                <h3 className="pp-lw-preview-booth-name">{booth.employerName}</h3>
                <p className="pp-lw-preview-booth-pitch">{booth.pitch}</p>
                <p className="pp-lw-preview-booth-roles">{booth.rolesHiring}</p>
              </article>
            ))}
          </div>
          <Link href={fairHref} className="pp-lw-preview-link">
            Open public fair →
          </Link>
        </div>
      ) : (
        <div className="pp-lw-preview-video" role="tabpanel">
          <div className="pp-lw-preview-video-frame">
            <iframe
              title={video.title}
              src={workforceEmbedUrl(video.youtubeId)}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="pp-lw-preview-iframe"
            />
          </div>
          <p className="pp-lw-preview-video-title">{video.title}</p>
          <p className="pp-lw-preview-video-meta">
            {video.durationMin} min · {video.ceEligible ? "CE eligible" : "Illustrative"} · YouTube
            embed
          </p>
        </div>
      )}

      <p className="pp-lw-preview-disclaimer" role="note">
        {fair.disclaimer}
      </p>
    </div>
  );
}
