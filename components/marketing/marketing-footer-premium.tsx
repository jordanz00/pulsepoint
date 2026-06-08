import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { BrandLogo } from "@/components/brand-logo";

export function MarketingFooterPremium() {
  return (
    <footer className="pc-glass-chrome border-t border-[color-mix(in_srgb,var(--pc-border)_60%,transparent)] text-[var(--fg-default)]">
      <div className="mk-container flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <BrandLogo size="md" />
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.012em] text-[var(--pc-text)]">
              {BRAND_NAME}
            </p>
            <p className="mt-1 text-[13px] text-[var(--pc-text-tertiary)]">
              Association management for healthcare associations
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-[13px] sm:gap-7" aria-label="Footer">
          <a
            href="#integrations"
            className="font-medium tracking-[-0.005em] text-[var(--pc-text-secondary)] transition-colors hover:text-[var(--pc-text)]"
          >
            Integrations
          </a>
          <a
            href="#security"
            className="font-medium tracking-[-0.005em] text-[var(--pc-text-secondary)] transition-colors hover:text-[var(--pc-text)]"
          >
            Security
          </a>
          <Link
            href="/compare-protech"
            className="font-medium tracking-[-0.005em] text-[var(--pc-text-secondary)] transition-colors hover:text-[var(--pc-text)]"
          >
            vs Protech
          </Link>
          <Link
            href="/whats-new"
            className="font-medium tracking-[-0.005em] text-[var(--pc-text-secondary)] transition-colors hover:text-[var(--pc-text)]"
          >
            What&apos;s new
          </Link>
          <Link
            href="/demo"
            className="font-medium tracking-[-0.005em] text-[var(--pc-text-secondary)] transition-colors hover:text-[var(--pc-text)]"
          >
            Demo
          </Link>
          <Link
            href="/privacy"
            className="font-medium tracking-[-0.005em] text-[var(--pc-text-secondary)] transition-colors hover:text-[var(--pc-text)]"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="font-medium tracking-[-0.005em] text-[var(--pc-text-secondary)] transition-colors hover:text-[var(--pc-text)]"
          >
            Terms
          </Link>
        </nav>
      </div>
      <p className="border-t border-[color-mix(in_srgb,var(--pc-border)_50%,transparent)] py-5 text-center text-xs text-[var(--pc-text-tertiary)]">
        © {new Date().getFullYear()} {BRAND_NAME}. Prototype demo — illustrative data only.
      </p>
    </footer>
  );
}
