import Link from "next/link";
import { VideoEmbedPlayer } from "@/components/learn/video-embed-player";
import { workforceTrackLabel } from "@/lib/learn/video-embed";

export type PlaylistLibraryItem = {
  id: string;
  title: string;
  description: string;
  trackSlug: string;
  items: Array<{
    id: string;
    title: string;
    videoUrl: string;
    durationMin: number;
    ceEligible: boolean;
  }>;
};

export function PlaylistLibrary({
  orgSlug,
  orgName,
  playlists,
  alphaDisclaimer = true,
}: {
  orgSlug: string;
  orgName: string;
  playlists: PlaylistLibraryItem[];
  alphaDisclaimer?: boolean;
}) {
  return (
    <main className="giving-public pp-learn-library">
      <div className="giving-public__inner">
        <p className="giving-public__org">
          <Link href={`/${orgSlug}`}>{orgName}</Link>
        </p>
        <p className="text-xs uppercase tracking-wide text-zinc-500">PulsePoint Learn · Alpha</p>
        <h1 className="giving-public__title">Workforce video library</h1>
        <p className="giving-public__lead">
          Curated clips for nursing, allied health, and association advocacy — producer-built, on your
          member platform.
        </p>
        {alphaDisclaimer ? (
          <p className="pp-learn-library-disclaimer text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            Alpha preview — CE credit from watch time is roadmap. Videos are illustrative until your
            association approves content.
          </p>
        ) : null}

        <div className="mt-10 space-y-12">
          {playlists.map((playlist) => (
            <section key={playlist.id} className="pp-learn-playlist-section">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {workforceTrackLabel(playlist.trackSlug)}
              </p>
              <h2 className="text-xl font-semibold mt-1">{playlist.title}</h2>
              {playlist.description ? (
                <p className="text-[var(--pc-text-secondary)] mt-2 max-w-2xl">{playlist.description}</p>
              ) : null}
              <ul className="mt-6 space-y-8">
                {playlist.items.map((item) => (
                  <li key={item.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <span className="text-xs text-zinc-500">
                        {item.durationMin > 0 ? `${item.durationMin} min` : "—"}
                        {item.ceEligible ? " · CE-eligible (alpha)" : ""}
                      </span>
                    </div>
                    <VideoEmbedPlayer videoUrl={item.videoUrl} title={item.title} />
                  </li>
                ))}
                {playlist.items.length === 0 ? (
                  <li className="text-sm text-zinc-500">No videos in this playlist yet.</li>
                ) : null}
              </ul>
            </section>
          ))}
          {playlists.length === 0 ? (
            <p className="text-sm text-zinc-500">No playlists published yet.</p>
          ) : null}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={`/${orgSlug}/learn/workforce`} className="pc-btn-secondary">
            Staff: manage workforce
          </Link>
          <Link href={`/${orgSlug}/members`} className="pc-btn-secondary">
            MemberCore
          </Link>
        </div>
      </div>
    </main>
  );
}
