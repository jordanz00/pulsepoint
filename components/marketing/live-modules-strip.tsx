import Link from "next/link";
import { PULSE_PRODUCTS } from "@/lib/products";

export function LiveModulesStrip({ userId }: { userId: string | null | undefined }) {
  const live = PULSE_PRODUCTS.filter((p) => p.status === "available");

  return (
    <section className="bg-[var(--pc-bg)] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-lg font-semibold text-[var(--pc-navy)]">
          Live in the prototype today
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {live.map((p) => (
            <span
              key={p.id}
              className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-900 ring-1 ring-sky-200/60"
            >
              {p.name}
            </span>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-slate-500">
          Plus import review, exception queue, settings, and public event registration.
        </p>
        {!userId && (
          <p className="mt-6 text-center">
            <Link href="/sign-up" className="pc-btn-primary">
              Start your organization
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
