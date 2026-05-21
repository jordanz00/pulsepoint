import Link from "next/link";
import { SALES_CTAS } from "@/lib/marketing-catalog";

export function MarketingCtas({
  compact,
  standalone = false,
}: {
  compact?: boolean;
  standalone?: boolean;
}) {
  const demoHref = standalone ? "/demo" : undefined;
  const cls = compact
    ? "pc-btn-primary !min-h-9 !px-4 !py-2 !text-sm"
    : "pc-btn-primary";
  const secondaryCls = compact
    ? "pc-btn-secondary !min-h-9 !px-4 !py-2 !text-sm"
    : "pc-btn-secondary";

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={SALES_CTAS.bookCall.href}
        className={secondaryCls}
        target={SALES_CTAS.bookCall.href.startsWith("http") ? "_blank" : undefined}
        rel={SALES_CTAS.bookCall.href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {SALES_CTAS.bookCall.label}
      </a>
      <Link href={demoHref ?? SALES_CTAS.requestDemo.href} className={cls}>
        {standalone ? "Try demo" : SALES_CTAS.requestDemo.label}
      </Link>
    </div>
  );
}
