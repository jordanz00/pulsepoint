import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * After sign-in, send staff to their active Clerk org dashboard.
 */
export default async function DashboardRedirectPage() {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }
  if (session.orgSlug) {
    redirect(`/${session.orgSlug}`);
  }
  redirect("/onboarding");
}
