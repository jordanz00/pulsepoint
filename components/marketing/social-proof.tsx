import { SOCIAL_PROOF } from "@/lib/marketing-catalog";

export function SocialProofStrip() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
        {SOCIAL_PROOF.headline}
      </p>
      <p className="mx-auto mt-3 max-w-2xl text-slate-600">{SOCIAL_PROOF.sub}</p>
    </section>
  );
}
