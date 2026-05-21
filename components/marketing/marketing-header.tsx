import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { MarketingCtas } from "@/components/marketing/marketing-ctas";

export function MarketingHeader({
  userId,
}: {
  userId: string | null | undefined;
}) {
  return (
    <header className="border-b border-slate-800/50 bg-[var(--pc-navy)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          {BRAND_NAME}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {userId ? (
            <Link
              href="/dashboard"
              className="pc-btn-primary !min-h-9 !bg-sky-500 !hover:bg-sky-400"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="inline-flex min-h-9 items-center px-3 text-sm font-medium text-slate-300 hover:text-white"
              >
                Sign in
              </Link>
              <MarketingCtas compact />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
