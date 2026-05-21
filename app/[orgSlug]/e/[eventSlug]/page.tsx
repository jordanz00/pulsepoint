import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { PublicRegistrationForm } from "@/components/events/public-registration-form";

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

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="mx-auto max-w-lg px-4">
        <p className="text-sm font-medium text-teal-700">{org.name}</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">{event.title}</h1>
        <p className="mt-2 text-zinc-600">{event.startsAt.toLocaleString()}</p>
        {event.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-700">
            {event.description}
          </p>
        )}

        {query.registered === "1" && (
          <p className="mt-6 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-900">
            Thank you — your registration is confirmed.
          </p>
        )}
        {query.cancelled === "1" && (
          <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Payment was cancelled. You can register again below.
          </p>
        )}

        <div className="mt-8">
          <PublicRegistrationForm
            orgSlug={orgSlug}
            eventSlug={eventSlug}
            priceCents={event.priceCents}
          />
        </div>
        <p className="mt-8 text-center text-xs text-zinc-400">
          Powered by PulseCore
        </p>
      </div>
    </div>
  );
}
