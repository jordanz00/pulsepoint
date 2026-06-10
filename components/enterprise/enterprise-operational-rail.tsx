"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  orgSlug: string;
  exceptionCount?: number;
};

const LINKS = [
  { id: "overview", label: "Overview", suffix: "" },
  { id: "command-center", label: "Command center", suffix: "/command-center" },
  { id: "intelligence", label: "Intelligence", suffix: "/intelligence" },
  { id: "mission-control", label: "Mission control", suffix: "/mission-control" },
  { id: "compliance", label: "Compliance", suffix: "/compliance" },
  { id: "exceptions", label: "Exceptions", suffix: "/exceptions" },
  { id: "sync", label: "Sync", suffix: "/sync" },
  { id: "audit", label: "Audit", suffix: "/audit" },
] as const;

/** Enterprise ops rail — fast paths for executives and operators. */
export function EnterpriseOperationalRail({ orgSlug, exceptionCount = 0 }: Props) {
  const pathname = usePathname();
  const base = `/${orgSlug}`;

  return (
    <nav className="pp-enterprise-rail" aria-label="Operations shortcuts">
      <span className="pp-enterprise-rail__label">Operations</span>
      <ul className="pp-enterprise-rail__list">
        {LINKS.map((item) => {
          const href = `${base}${item.suffix}`;
          const active =
            item.suffix === ""
              ? pathname === base || pathname === `${base}/`
              : pathname === href || pathname.startsWith(`${href}/`);
          const showExceptionBadge = item.id === "exceptions" && exceptionCount > 0;

          return (
            <li key={item.id}>
              <Link
                href={href}
                className={`pp-enterprise-rail__link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                {showExceptionBadge ? (
                  <span className="pp-enterprise-rail__badge" aria-label={`${exceptionCount} open`}>
                    {exceptionCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
