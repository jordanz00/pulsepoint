import Link from "next/link";
import { adOpsPaths } from "@/lib/ad-ops-paths";

export function AdOpsSubnav({ orgSlug }: { orgSlug: string }) {
  const p = adOpsPaths(orgSlug);
  const links = [
    { href: p.home, label: "Dashboard" },
    { href: p.campaigns, label: "Campaigns" },
    { href: p.sync, label: "Sync queue" },
    { href: p.audit, label: "Audit log" },
    { href: p.onboarding, label: "Checklist" },
    { href: p.metrics, label: "Metrics" },
  ];

  return (
    <nav className="ad-ops-nav" aria-label="Healthcare advertising operations">
      <strong className="ad-ops-nav__title">Ad operations</strong>
      {links.map((l) => (
        <Link key={l.href} href={l.href}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
