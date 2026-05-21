import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { HapLogo } from "@/components/hap-logo";
import { MarketingCtas } from "@/components/marketing/marketing-ctas";

export function MarketingHeader({
  userId,
  standalone = false,
}: {
  userId: string | null | undefined;
  standalone?: boolean;
}) {
  const dashboardHref = standalone ? "/demo-healthcare" : "/dashboard";
  const signInHref = standalone ? "/demo" : "/sign-in";
  return (
    <header className="border-b border-[var(--pc-navy-border)] bg-[var(--pc-brand)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <HapLogo size={40} priority />
          <span className="text-lg font-semibold tracking-tight text-white">
            {BRAND_NAME}
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {userId ? (
            <Link href={dashboardHref} className="pc-btn-warm !min-h-9 !px-4 !py-2 !text-sm">
              Open dashboard
            </Link>
          ) : (
            <>
              {!standalone ? (
                <Link
                  href={signInHref}
                  className="inline-flex min-h-9 items-center px-3 text-sm font-medium text-white/85 hover:text-white"
                >
                  Sign in
                </Link>
              ) : null}
              <MarketingCtas compact standalone={standalone} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
