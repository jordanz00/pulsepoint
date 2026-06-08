import Image from "next/image";
import { getIntegrationProfile } from "@/lib/integration-profile";

type MarkSize = number | "hero" | "lg" | "md" | "sm";

const MARK_SIZES: Record<Exclude<MarkSize, number>, number> = {
  hero: 72,
  lg: 40,
  md: 32,
  sm: 26,
};

function resolveMarkSize(size: MarkSize): number {
  return typeof size === "number" ? size : MARK_SIZES[size];
}

/** PulsePoint PP squircle — liquid-glass app icon used across marketing + admin shell. */
export function PulsePointMark({
  size = "md",
  className = "",
}: {
  size?: MarkSize;
  className?: string;
}) {
  const px = resolveMarkSize(size);
  const hero = size === "hero";

  return (
    <span
      className={`pp-brand-mark${hero ? " pp-brand-mark--hero" : ""} ${className}`.trim()}
      style={
        hero
          ? undefined
          : {
              width: px,
              height: px,
              fontSize: Math.round(px * 0.36),
            }
      }
      aria-hidden
    >
      PP
    </span>
  );
}

/** HAP corporate mark — only when INTEGRATION_PROFILE=hap-azure. See docs/ENTERPRISE-INTEGRATION.md */
function HapMark({
  size = 40,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/haplogo_box_blue.jpeg"
      alt="The Hospital and Healthsystem Association of Pennsylvania"
      width={size}
      height={size}
      className={`shrink-0 rounded-md object-contain ${className}`}
      priority={priority}
    />
  );
}

type BrandLogoProps = {
  size?: MarkSize;
  className?: string;
  priority?: boolean;
};

/**
 * Logo in header/sidebar — demo profile uses PulsePoint mark only.
 * HAP artwork is gated until enterprise integration is approved.
 */
export function BrandLogo({ size = "md", className = "", priority = false }: BrandLogoProps) {
  const profile = getIntegrationProfile();
  if (profile.useHapBrand) {
    const px = resolveMarkSize(size);
    return <HapMark size={px} className={className} priority={priority} />;
  }
  return <PulsePointMark size={size} className={className} />;
}

/** @deprecated Use BrandLogo — kept for gradual migration */
export function HapLogo(props: BrandLogoProps) {
  return <BrandLogo {...props} />;
}
