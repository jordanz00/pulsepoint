import Image from "next/image";

/**
 * Official HAP brand mark — same asset as 340B / regulatory advocacy dashboards.
 * Source: haplogo_box_blue.jpeg (HAP April 2025 branding; blue box + ribbon).
 *
 * Note: `hap-logo.svg` in the repo root was a placeholder wordmark, not the
 * corporate logo. Do not apply CSS invert filters to the real mark.
 */
const HAP_LOGO_SRC = "/haplogo_box_blue.jpeg";

type HapLogoProps = {
  /** Square logo size in px (official mark is roughly 1:1). */
  size?: number;
  className?: string;
  priority?: boolean;
};

export function HapLogo({
  size = 40,
  className = "",
  priority = false,
}: HapLogoProps) {
  return (
    <Image
      src={HAP_LOGO_SRC}
      alt="The Hospital and Healthsystem Association of Pennsylvania"
      width={size}
      height={size}
      className={`shrink-0 rounded-md object-contain ${className}`}
      priority={priority}
    />
  );
}
