import { parseVideoEmbedUrl } from "@/lib/learn/video-embed";

export function VideoEmbedPlayer({
  videoUrl,
  title,
}: {
  videoUrl: string;
  title: string;
}) {
  const parsed = parseVideoEmbedUrl(videoUrl);
  if (!parsed) {
    return (
      <div className="pp-learn-video-placeholder glass pp-glass-surface p-6 text-center text-sm text-zinc-500">
        Video coming soon — add a YouTube or Vimeo URL in admin.
      </div>
    );
  }

  return (
    <div className="pp-learn-video-frame aspect-video w-full overflow-hidden rounded-xl border border-[var(--pc-border-subtle)] bg-black">
      <iframe
        src={parsed.embedUrl}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
