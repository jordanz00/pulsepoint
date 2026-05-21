export function VsLegacyStrip() {
  return (
    <section className="border-y border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--pc-navy)]">
          The modern alternative to legacy AMS
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
          PulsePoint is built for healthcare associations that want Protech-class
          capabilities—membership, events, education, commerce, and insights—without
          million-dollar contracts or decade-long implementations. Start with{" "}
          <strong className="font-semibold text-slate-800">MemberCore</strong> and{" "}
          <strong className="font-semibold text-slate-800">PulsePoint Events</strong>{" "}
          today; expand module by module with clear Live and Roadmap labels.
        </p>
        <dl className="mx-auto mt-10 grid max-w-3xl gap-6 text-left sm:grid-cols-3">
          <div className="pc-card">
            <dt className="text-xs font-bold uppercase tracking-wide text-sky-700">
              Easier to use
            </dt>
            <dd className="mt-2 text-sm text-slate-600">
              Clean staff UI, public registration pages, and staged imports—not
              spreadsheet archaeology.
            </dd>
          </div>
          <div className="pc-card">
            <dt className="text-xs font-bold uppercase tracking-wide text-sky-700">
              Honest roadmap
            </dt>
            <dd className="mt-2 text-sm text-slate-600">
              Live vs Roadmap on every module. No grant-deck vapor for Commerce or
              Insights.
            </dd>
          </div>
          <div className="pc-card">
            <dt className="text-xs font-bold uppercase tracking-wide text-sky-700">
              Built secure
            </dt>
            <dd className="mt-2 text-sm text-slate-600">
              Multi-tenant isolation, audited exports, and ten automated leak checks in
              CI.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
