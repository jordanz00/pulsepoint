import { DIFFERENTIATORS } from "@/lib/brand";

export function DifferentiatorsSection() {
  return (
    <section className="py-16">
      <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--pc-text)]">
        What makes it different
      </h2>
      <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
        {DIFFERENTIATORS.map((item) => (
          <li
            key={item}
            className="flex gap-3 rounded-lg border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
          >
            <span className="mt-0.5 text-sky-500" aria-hidden>
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
