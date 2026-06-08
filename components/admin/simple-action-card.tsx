import Link from "next/link";

/**
 * Large, plain action tile for non-technical staff (overview home screen).
 */
export function SimpleActionCard({
  href,
  title,
  description,
  value,
}: {
  href: string;
  title: string;
  description: string;
  value?: string | number;
}) {
  return (
    <Link href={href} className="pc-simple-action-card group">
      <p className="pc-simple-action-title">{title}</p>
      {value !== undefined ? (
        <p className="pc-simple-action-value">{value}</p>
      ) : null}
      <p className="pc-simple-action-desc">{description}</p>
      <span className="pc-simple-action-cta">
        Open
        <span
          aria-hidden
          className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </Link>
  );
}
