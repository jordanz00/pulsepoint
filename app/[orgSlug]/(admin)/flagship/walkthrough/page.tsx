import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { FlagshipWalkthroughSteps } from "@/components/showcase/flagship-walkthrough-steps";
import { clampFlagshipStepIndex } from "@/lib/flagship-walkthrough";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Flagship Walkthrough — PulsePoint",
  description: "Five-stop sales demo script for Flagship features.",
};

export default async function FlagshipWalkthroughPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { orgSlug } = await params;
  const sp = await searchParams;
  const activeIndex = clampFlagshipStepIndex(sp.step);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Flagship walkthrough"
        subtitle="Five-stop sales script — executive, membership, advocacy, board, migration."
        backHref={`/${orgSlug}/flagship`}
        backLabel="Flagship features"
      />
      <FlagshipWalkthroughSteps orgSlug={orgSlug} activeIndex={activeIndex} />
    </AdminPage>
  );
}
