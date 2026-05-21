import { auth } from "@clerk/nextjs/server";
import { getPortalProfile } from "@/app/actions/portal";
import { PortalProfileForm } from "@/components/portal/portal-profile-form";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";

export default async function PortalAdminPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const session = await auth();
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });

  const profile = session?.userId
    ? await getPortalProfile(orgSlug)
    : { ok: false as const, error: "Sign in required" };

  const db = org ? getOrgDb(org.id) : null;
  const linkedCount = db
    ? await db.member.count({
        where: { clerkUserId: { not: null } },
      })
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Member portal</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Members with a linked Clerk account can view registrations and edit their
          profile. Staff can preview the portal below when their user is linked to a
          member record ({linkedCount} linked).
        </p>
      </div>

      {profile.ok && profile.data ? (
        <>
          <PortalProfileForm
            orgSlug={orgSlug}
            initial={{
              firstName: profile.data.member.firstName,
              lastName: profile.data.member.lastName,
              email: profile.data.member.email ?? undefined,
              phone: profile.data.member.phone ?? undefined,
            }}
          />
          <section>
            <h2 className="text-lg font-semibold">Your registrations</h2>
            <ul className="mt-3 divide-y rounded-xl border bg-white">
              {profile.data.registrations.map((r) => (
                <li key={r.id} className="px-4 py-3 text-sm">
                  <p className="font-medium">{r.event.title}</p>
                  <p className="text-zinc-500">
                    {r.event.startsAt.toLocaleString()} · {r.status}
                    {r.paidAt ? " · Paid" : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {(!profile.ok ? profile.error : null) ??
            "Link a member record to your Clerk user (set clerkUserId) to use the portal preview."}
        </p>
      )}
    </div>
  );
}
