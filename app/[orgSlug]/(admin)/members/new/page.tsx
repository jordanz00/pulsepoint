import { MemberForm } from "@/components/members/member-form";

export default async function NewMemberPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New member</h1>
      <MemberForm orgSlug={orgSlug} />
    </div>
  );
}
