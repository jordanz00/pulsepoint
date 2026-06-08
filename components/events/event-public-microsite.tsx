import Link from "next/link";
import { PublicRegistrationForm } from "@/components/events/public-registration-form";
import { CareerFairBoothGrid } from "@/components/events/career-fair-booth-grid";
import type { CareerFairBooth } from "@/lib/events/career-fair-booths";
import { BRAND_NAME } from "@/lib/brand";

export type MicrositeConfig = {
  headline?: string;
  accent?: string;
  heroImage?: string;
  showSpeakers?: boolean;
  showSponsors?: boolean;
  showSessions?: boolean;
};

type Speaker = { id: string; name: string; title: string; role: string; organizationName: string };
type Sponsor = { id: string; name: string; tier: string };
type Session = { id: string; title: string; startsAt: Date; room: string; track: string };
type Ticket = { id: string; name: string; priceCents: number };

export function EventPublicMicrosite({
  org,
  event,
  micrositeConfig,
  speakers,
  sponsors,
  sessions,
  tickets,
  query,
  eventKind,
  careerFairBooths,
  careerFairDisclaimer,
}: {
  org: { name: string; slug: string };
  event: {
    title: string;
    description: string;
    startsAt: Date;
    publicSlug: string;
    priceCents: number;
  };
  micrositeConfig: MicrositeConfig | null;
  speakers: Speaker[];
  sponsors: Sponsor[];
  sessions: Session[];
  tickets: Ticket[];
  query: { registered?: string; cancelled?: string };
  eventKind?: string;
  careerFairBooths?: CareerFairBooth[];
  careerFairDisclaimer?: string;
}) {
  const cfg = micrositeConfig ?? {};
  const accent = cfg.accent ?? "#0ea5e9";
  const headline = cfg.headline ?? event.title;
  const showSpeakers = cfg.showSpeakers !== false;
  const showSponsors = cfg.showSponsors !== false;
  const showSessions = cfg.showSessions !== false;
  const minPrice =
    tickets.length > 0 ? Math.min(...tickets.map((t) => t.priceCents)) : event.priceCents;
  const isCareerFair = eventKind === "VIRTUAL_CAREER_FAIR";
  const registerAnchor = `#register`;

  return (
    <div className="pp-canvas min-h-screen">
      <header className="pc-glass-chrome sticky top-0 z-20 border-b px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <span className="font-semibold text-[var(--pc-text)]">{org.name}</span>
          <Link href={`/${org.slug}/calendar`} className="text-xs font-semibold text-[var(--pc-brand)]">
            Event calendar
          </Link>
        </div>
      </header>

      <section
        className="px-4 py-14 text-white"
        style={{ background: `linear-gradient(135deg, ${accent}, #0f172a)` }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest opacity-90">
            {isCareerFair ? "Virtual career fair" : "Event microsite"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{headline}</h1>
          <p className="mt-4 text-lg opacity-95">{event.startsAt.toLocaleString()}</p>
          <p className="mt-2 text-sm opacity-90">
            {minPrice > 0 ? `From $${(minPrice / 100).toFixed(2)}` : "Free registration"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        {event.description ? (
          <div className="pc-card">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--pc-text-secondary)]">
              {event.description}
            </p>
          </div>
        ) : null}

        {isCareerFair && careerFairBooths && careerFairBooths.length > 0 ? (
          <CareerFairBoothGrid
            booths={careerFairBooths}
            disclaimer={careerFairDisclaimer ?? "Alpha preview — illustrative employer booths."}
            registerHref={registerAnchor}
          />
        ) : null}

        {showSpeakers && speakers.length > 0 ? (
          <div className="pc-card">
            <h2 className="text-lg font-semibold">Speakers</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {speakers.map((s) => (
                <li key={s.id} className="rounded-2xl border border-[var(--pc-border)] p-4">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-[var(--pc-text-secondary)]">{s.title}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {showSponsors && sponsors.length > 0 ? (
          <div className="pc-card">
            <h2 className="text-lg font-semibold">Sponsors</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {sponsors.map((s) => (
                <span key={s.id} className="rounded-full border px-4 py-2 text-sm font-medium">
                  {s.name} · {s.tier}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {showSessions && sessions.length > 0 ? (
          <div className="pc-card">
            <h2 className="text-lg font-semibold">Agenda</h2>
            <ul className="mt-4 divide-y divide-[var(--pc-border)]">
              {sessions.map((s) => (
                <li key={s.id} className="flex justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-[var(--pc-text-secondary)]">{s.track}</p>
                  </div>
                  <p>{s.startsAt.toLocaleTimeString()}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {query.registered === "1" ? (
          <p className="pc-card text-sm text-[var(--status-live-fg)]">Registration confirmed.</p>
        ) : null}

        <div className="pc-card" id="register">
          <h2 className="text-lg font-semibold">Register</h2>
          <div className="mt-4">
            <PublicRegistrationForm
              orgSlug={org.slug}
              eventSlug={event.publicSlug}
              priceCents={minPrice}
              ticketTypes={tickets}
            />
          </div>
        </div>
      </div>

      <footer className="border-t py-8 text-center text-xs text-[var(--pc-text-tertiary)]">
        Powered by {BRAND_NAME}
      </footer>
    </div>
  );
}
