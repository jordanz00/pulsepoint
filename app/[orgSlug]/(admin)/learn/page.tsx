import Link from "next/link";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { LearnQuickAdd } from "@/components/learn/learn-quick-add";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { ADMIN_PAGES, isEasyAdminMode, pageSubtitle } from "@/lib/admin-page-copy";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const easy = isEasyAdminMode(orgSlug);
  const staff = await requireOrgAccessForSlug(orgSlug);
  const db = getOrgDb(staff.orgId);

  const [creditTypes, courses, recentAwards, enrollMembers] = await Promise.all([
    db.cECreditType.findMany({ orderBy: { code: "asc" }, take: 50 }),
    db.course.findMany({
      include: { creditType: true, _count: { select: { enrollments: true } } },
      orderBy: { createdAt: "desc" },
      take: easy ? 20 : 50,
    }),
    db.cECreditAward.findMany({
      include: { member: true, creditType: true },
      orderBy: { awardedAt: "desc" },
      take: easy ? 0 : 20,
    }),
    db.member.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
      take: 30,
    }),
  ]);

  if (easy) {
    return (
      <AdminPage orgSlug={orgSlug}>
        <PageHeader
          title={ADMIN_PAGES.learn.title}
          subtitle={pageSubtitle(orgSlug, "learn")}
          backHref={`/${orgSlug}`}
          backLabel="Home"
        />
        <ModuleLandingBriefing orgId={staff.orgId} orgSlug={orgSlug} productId="learn" />
        <p className="text-base text-[var(--pc-text-secondary)]">
          Early preview — sample courses below.
        </p>
        {courses.length === 0 ? (
          <p className="text-[var(--pc-text-secondary)]">No courses in the demo yet.</p>
        ) : (
          <ul className="pc-simple-list">
            {courses.map((c) => (
              <li key={c.id} className="px-5 py-4">
                <p className="font-medium text-[var(--pc-text)]">{c.title}</p>
                <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
                  {c._count.enrollments} enrolled · {c.status === "PUBLISHED" ? "Published" : "Draft"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </AdminPage>
    );
  }

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="PulsePoint Learn"
        subtitle={pageSubtitle(orgSlug, "learn")}
        badge="alpha"
        actions={
          <>
            <Link href={`/${orgSlug}/learn/library`} className="pc-btn-secondary">
              Video library
            </Link>
            <Link href={`/${orgSlug}/learn/workforce`} className="pc-btn-secondary">
              Workforce
            </Link>
          </>
        }
      />
      <ModuleLandingBriefing orgId={staff.orgId} orgSlug={orgSlug} productId="learn" />
      <LearnQuickAdd
        orgSlug={orgSlug}
        creditTypes={creditTypes}
        courses={courses.map((c) => ({ id: c.id, title: c.title }))}
        members={enrollMembers.map((m) => ({
          id: m.id,
          label: `${m.firstName} ${m.lastName}`.trim(),
        }))}
      />
      <section>
        <h2 className="pc-simple-section-title mb-3">Courses ({courses.length})</h2>
        <div className="pc-table-wrap">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Credit</th>
                <th>Status</th>
                <th>Enrollments</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>
                    {c.creditType ? `${c.creditAmount} ${c.creditType.code}` : c.creditAmount || "—"}
                  </td>
                  <td>
                    <Badge variant={c.status === "PUBLISHED" ? "live" : "roadmap"}>{c.status}</Badge>
                  </td>
                  <td>{c._count.enrollments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {recentAwards.length > 0 ? (
        <section>
          <h2 className="pc-simple-section-title mb-3">Recent awards</h2>
          <div className="pc-table-wrap">
            <table className="pc-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Credit</th>
                  <th>Awarded</th>
                </tr>
              </thead>
              <tbody>
                {recentAwards.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.member.firstName} {a.member.lastName}
                    </td>
                    <td>
                      {a.amount} {a.creditType.code}
                    </td>
                    <td>{new Date(a.awardedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </AdminPage>
  );
}
