import { FAQ_ITEMS } from "@/lib/marketing-content";

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-slate-200 bg-white py-16">
      <h2 className="text-center text-2xl font-bold text-[var(--pc-navy)]">
        Frequently Asked Questions
      </h2>
      <dl className="mx-auto mt-10 max-w-3xl space-y-8">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question}>
            <dt className="text-lg font-semibold text-slate-900">
              {item.question}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-600">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
