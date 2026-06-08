import { redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { DemoWalkthroughSteps } from "@/components/demo-walkthrough-steps";
import { clampStepIndex } from "@/lib/demo-walkthrough";
import { ADMIN_PAGES, pageSubtitle } from "@/lib/admin-page-copy";
import { isDemoOrgSlug } from "@/lib/demo-suite";

export const dynamic = "force-dynamic";

export default async function WalkthroughPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { orgSlug } = await params;
  if (!isDemoOrgSlug(orgSlug)) {
    redirect(`/${orgSlug}`);
  }

  const sp = await searchParams;
  const activeIndex = clampStepIndex(sp.step);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={ADMIN_PAGES.walkthrough.title}
        subtitle={pageSubtitle(orgSlug, "walkthrough")}
        backHref={`/${orgSlug}`}
        backLabel="Home"
      />
      <DemoWalkthroughSteps orgSlug={orgSlug} activeIndex={activeIndex} simple={false} />
    </AdminPage>
  );
}
