import Link from "next/link";
import { QUICK_TOUR, SALES_CTAS } from "@/lib/marketing-catalog";

export function QuickTourSection() {
  return (
    <section className="py-16">
      <div className="pc-section-navy mx-auto max-w-3xl rounded-2xl px-8 py-12 text-center sm:px-12">
        <p className="text-sm font-medium uppercase tracking-wider text-sky-400">
          Quick tour
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          {QUICK_TOUR.headline}
        </h2>
        <p className="mt-4 text-slate-300">{QUICK_TOUR.lead}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-400"
          >
            {QUICK_TOUR.cta}
          </Link>
          <a
            href={SALES_CTAS.bookCall.href}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-500 px-6 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-400 hover:text-white"
          >
            {QUICK_TOUR.secondary}
          </a>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          No bloated enterprise tour—create an org and explore MemberCore & Events in
          minutes.
        </p>
      </div>
    </section>
  );
}
