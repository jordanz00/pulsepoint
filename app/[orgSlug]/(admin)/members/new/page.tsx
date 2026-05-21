import { MemberForm } from "@/components/members/member-form";

export default async function NewMemberPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">MemberCore</h1>
      <p className="mb-6 text-sm text-slate-500">Add a new member</p>
      <MemberForm orgSlug={orgSlug} />
    </div>
  );
}
