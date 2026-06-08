import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import {
  RenewalCheckoutWizard,
  type WorkflowStep,
} from "@/components/members/renewal-checkout-wizard";

export default async function PublicJoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
}) {
  const { orgSlug } = await params;
  const query = await searchParams;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const [workflow, tiers] = await Promise.all([
    db.renewalWorkflow.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.memberTier.findMany({
      orderBy: { priceCents: "asc" },
      include: { product: { select: { id: true, active: true } } },
    }),
  ]);

  const DEFAULT_STEPS: WorkflowStep[] = [
    { id: "profile", order: 0, type: "profile", label: "Your information" },
    { id: "dues", order: 1, type: "dues", label: "Select membership tier" },
    { id: "terms", order: 2, type: "terms", label: "Membership terms" },
    { id: "payment", order: 3, type: "payment", label: "Pay dues" },
    { id: "welcome", order: 4, type: "welcome", label: "Welcome back" },
  ];

  const rawSteps = workflow?.steps as WorkflowStep[] | undefined;
  const mapped =
    rawSteps
      ?.filter((s) =>
        ["profile", "dues", "terms", "payment", "welcome", "custom"].includes(s.type),
      )
      .map((s) => ({
        id: s.id,
        order: s.order,
        type: s.type,
        label: s.label,
      })) ?? [];
  const steps = mapped.length > 0 ? mapped : DEFAULT_STEPS;

  return (
    <div className="pp-canvas min-h-screen">
      <header className="pc-glass-chrome border-b px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <span className="font-semibold text-[var(--pc-text)]">{org.name}</span>
          <Link href={`/${orgSlug}/portal`} className="text-xs font-semibold text-[var(--pc-brand)]">
            Member portal
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Join or renew</h1>
        <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
          Pay membership dues securely — your renewal date updates automatically when payment
          completes.
        </p>
        <div className="mt-8">
          <RenewalCheckoutWizard
            orgSlug={orgSlug}
            workflowName={workflow?.name ?? "Membership"}
            steps={steps}
            tiers={tiers.map((t) => ({
              id: t.id,
              name: t.name,
              priceCents: t.priceCents,
              billingInterval: t.billingInterval,
              productId: t.product?.active ? t.productId : null,
            }))}
            paid={query.paid === "1"}
            cancelled={query.cancelled === "1"}
          />
        </div>
      </div>
    </div>
  );
}
