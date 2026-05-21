import { FEATURE_PILLARS } from "@/lib/feature-pillars";
import { PillarComingSoon } from "@/components/pillar-coming-soon";

export default async function CommitteesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const pillar = FEATURE_PILLARS.find((p) => p.id === "committees")!;

  return <PillarComingSoon pillar={pillar} orgSlug={orgSlug} />;
}
