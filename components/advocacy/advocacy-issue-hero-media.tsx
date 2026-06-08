import Image from "next/image";
import { VideoEmbedPlayer } from "@/components/learn/video-embed-player";
import { resolveHeroImagePath } from "@/lib/advocacy/issue-media";

type Props = {
  title: string;
  heroVideoUrl?: string;
  heroImageUrl?: string;
};

/** Hero band — video preferred; still image fallback. */
export function AdvocacyIssueHeroMedia({ title, heroVideoUrl, heroImageUrl }: Props) {
  const imagePath = resolveHeroImagePath(heroImageUrl);

  if (heroVideoUrl?.trim()) {
    return (
      <div className="pp-advocacy-showcase__hero-media">
        <VideoEmbedPlayer videoUrl={heroVideoUrl} title={title} />
      </div>
    );
  }

  if (imagePath) {
    return (
      <div className="pp-advocacy-showcase__hero-media pp-advocacy-showcase__hero-media--still">
        <Image
          src={imagePath}
          alt=""
          width={1200}
          height={675}
          className="pp-advocacy-showcase__hero-image"
          priority
        />
      </div>
    );
  }

  return null;
}
