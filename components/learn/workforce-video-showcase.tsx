"use client";

import { useState } from "react";
import {
  WORKFORCE_SHOWCASE_VIDEOS,
  workforceEmbedUrl,
  type WorkforceShowcaseVideo,
} from "@/lib/learn/workforce-showcase-videos";

function VideoCard({
  video,
  active,
  onSelect,
}: {
  video: WorkforceShowcaseVideo;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`pp-workforce-video-card text-left${active ? " pp-workforce-video-card--active" : ""}`}
    >
      <span className="pp-workforce-video-card__title">{video.title}</span>
      <span className="pp-workforce-video-card__meta">
        {video.durationMin} min
        {video.ceEligible ? " · CE-eligible (alpha)" : ""}
      </span>
      <span className="pp-workforce-video-card__desc">{video.description}</span>
    </button>
  );
}

/** Portfolio demo — curated workforce video playlist with embed player. */
export function WorkforceVideoShowcase() {
  const [active, setActive] = useState(WORKFORCE_SHOWCASE_VIDEOS[0]!);

  return (
    <section className="pp-workforce-video-showcase glass pp-glass-surface" aria-label="Workforce video playlist">
      <header className="pp-demo-panel-head">
        <h2 className="pp-demo-panel-title">Career pipeline videos</h2>
        <p className="pp-demo-panel-sub">
          Illustrative preview — association-hosted video replaces these embeds in production.
        </p>
      </header>
      <div className="pp-workforce-video-showcase__layout">
        <div className="pp-workforce-video-showcase__player">
          <iframe
            title={active.title}
            src={workforceEmbedUrl(active.youtubeId)}
            className="pp-workforce-video-showcase__iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="pp-workforce-video-showcase__list" role="list">
          {WORKFORCE_SHOWCASE_VIDEOS.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              active={v.id === active.id}
              onSelect={() => setActive(v)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
