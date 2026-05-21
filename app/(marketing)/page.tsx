import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function MarketingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold text-teal-800">PulseCore</span>
        <div className="flex gap-3">
          {userId ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-zinc-700 hover:text-teal-800"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white"
              >
                Start free trial
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          Healthcare associations
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Member CRM and events—without Protech lock-in
        </h1>
        <p className="mt-6 text-lg text-zinc-600">
          PulseCore is multi-tenant association management built for healthcare
          associations: members, registrations, and a member portal—on your stack,
          not Microsoft Dynamics fees.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {!userId && (
            <Link
              href="/sign-up"
              className="rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white"
            >
              Create your organization
            </Link>
          )}
          <Link
            href="/terms"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700"
          >
            Terms
          </Link>
        </div>
      </main>
    </div>
  );
}
