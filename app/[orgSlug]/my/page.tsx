import { redirect } from "next/navigation";

/** Legacy self-service URL — consolidated into the member portal. */
export default async function MemberCoreSelfServiceRedirect({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/portal`);
}
