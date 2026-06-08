import { AdOpsSubnav } from "@/components/ad-ops/ad-ops-subnav";
import "./ad-ops.css";

export default async function AdvertisingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <div className="ad-ops-shell">
      <AdOpsSubnav orgSlug={orgSlug} />
      {children}
    </div>
  );
}
