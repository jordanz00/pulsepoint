import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { PlaylistLibrary } from "@/components/learn/playlist-library";

export const dynamic = "force-dynamic";

export default async function PublicLearnLibraryPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const playlists = await db.learnVideoPlaylist.findMany({
    where: { orgId: org.id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <PlaylistLibrary
      orgSlug={orgSlug}
      orgName={org.name}
      playlists={playlists.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        trackSlug: p.trackSlug,
        items: p.items.map((i) => ({
          id: i.id,
          title: i.title,
          videoUrl: i.videoUrl,
          durationMin: i.durationMin,
          ceEligible: i.ceEligible,
        })),
      }))}
    />
  );
}
