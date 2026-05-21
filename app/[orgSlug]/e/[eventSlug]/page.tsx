import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { PublicRegistrationForm } from "@/components/events/public-registration-form";
import { BRAND_NAME } from "@/lib/brand";

export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; eventSlug: string }>;
  searchParams: Promise<{ registered?: string; cancelled?: string }>;
}) {
  const { orgSlug, eventSlug } = await params;
  const query = await searchParams;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const event = await db.event.findFirst({
    where: { publicSlug: eventSlug, status: "PUBLISHED" },
  });
  if (!event) notFound();

  const priceLabel =
    event.priceCents > 0
      ? `$${(event.priceCents / 100).toFixed(2)}`
      : "Free";

  return (
    <div className="min-h-screen bg-[var(--pc-bg)]">
      <header className="border-b border-slate-200 bg-[var(--pc-navy)] px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="font-semibold text-white">{BRAND_NAME}</span>
          <span className="text-xs text-slate-400">Event registration</span>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-10">
        <p className="text-sm font-medium text-sky-700">{org.name}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--pc-navy)]">
          {event.title}
        </h1>
        <dl className="mt-4 grid gap-2 text-sm text-slate-600">
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-slate-500">When</dt>
            <dd>{event.startsAt.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-slate-500">Fee</dt>
            <dd>{priceLabel}</dd>
          </div>
        </dl>
        {event.description && (
          <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {event.description}
          </p>
        )}

        {query.registered === "1" && (
          <p className="mt-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Thank you — your registration is confirmed.
          </p>
        )}
        {query.cancelled === "1" && (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Payment was cancelled. You can register again below.
          </p>
        )}

        <div className="pc-card mt-8">
          <h2 className="text-lg font-semibold text-[var(--pc-navy)]">Register</h2>
          <div className="mt-4">
            <PublicRegistrationForm
              orgSlug={orgSlug}
              eventSlug={eventSlug}
              priceCents={event.priceCents}
            />
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          Powered by{" "}
          <Link href="/" className="text-sky-600 hover:underline">
            {BRAND_NAME}
          </Link>
          · Modern AMS for healthcare associations
        </p>
      </div>
    </div>
  );
}
