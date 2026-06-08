"use client";

import Link from "next/link";
import type { CareerFairBooth } from "@/lib/events/career-fair-booths";

type Props = {
  booths: CareerFairBooth[];
  disclaimer: string;
  registerHref?: string;
};

/** Brazen-class booth grid — liquid glass, alpha honest labels. */
export function CareerFairBoothGrid({ booths, disclaimer, registerHref }: Props) {
  if (booths.length === 0) return null;

  return (
    <section className="pp-career-fair-booths" aria-labelledby="career-fair-booths-title">
      <header className="pp-career-fair-booths-head">
        <div>
          <p className="pp-career-fair-booths-kicker">Virtual career fair · Preview</p>
          <h2 id="career-fair-booths-title" className="pp-career-fair-booths-title">
            Employer booths
          </h2>
          <p className="pp-career-fair-booths-lead">
            Explore hospital and health system employers — register to save your booth visits.
          </p>
        </div>
        {registerHref ? (
          <Link href={registerHref} className="btn btn-primary pp-career-fair-booths-cta">
            Register free
          </Link>
        ) : null}
      </header>

      <div className="pp-career-fair-booth-grid" role="list">
        {booths.map((booth) => (
          <article
            key={booth.id}
            className="pp-career-fair-booth glass pp-glass-surface"
            role="listitem"
          >
            <div className="pp-career-fair-booth-top">
              <span className="pp-career-fair-booth-num">{booth.boothNumber}</span>
              {booth.logoUrl ? (
                <span
                  className="pp-career-fair-booth-logo-fallback pp-career-fair-booth-logo-fallback--img"
                  style={{ backgroundImage: `url(${booth.logoUrl})` }}
                  aria-hidden
                />
              ) : (
                <span className="pp-career-fair-booth-logo-fallback" aria-hidden>
                  {booth.employerName.slice(0, 1)}
                </span>
              )}
            </div>
            <h3 className="pp-career-fair-booth-name">{booth.employerName}</h3>
            <p className="pp-career-fair-booth-pitch">{booth.pitch}</p>
            <p className="pp-career-fair-booth-roles">
              <span>Hiring</span> {booth.rolesHiring}
            </p>
            {booth.websiteUrl ? (
              <a
                href={booth.websiteUrl}
                className="pp-career-fair-booth-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Employer site →
              </a>
            ) : (
              <span className="pp-career-fair-booth-soon">Live chat — coming soon</span>
            )}
          </article>
        ))}
      </div>

      <p className="pp-career-fair-booths-foot" role="note">
        {disclaimer}
      </p>
    </section>
  );
}
