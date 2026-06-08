import Link from "next/link";
import {
  ROLE_FILTER_MODE_LABELS,
  ROLE_FILTER_PRESET_LABELS,
} from "@/lib/member-role-filters";
import { ENGAGEMENT_TIER_LABEL } from "@/lib/engagement-score";
import {
  memberSearchToQueryString,
  type MemberSearchInput,
} from "@/lib/validations/member";

type Props = {
  orgSlug: string;
  values: MemberSearchInput;
  action?: string;
};

const QUICK_ROLE_FILTERS: Array<{
  preset: keyof typeof ROLE_FILTER_PRESET_LABELS;
  label: string;
}> = [
  { preset: "ceo", label: "CEOs" },
  { preset: "c_suite", label: "C-Suite" },
  { preset: "our_board", label: "Our board" },
  { preset: "external_board", label: "External board" },
  { preset: "committee", label: "Committees" },
];

const QUICK_ENGAGEMENT: Array<{
  tier: keyof typeof ENGAGEMENT_TIER_LABEL;
  label: string;
}> = [
  { tier: "active", label: "Highly engaged" },
  { tier: "at_risk", label: "At risk" },
  { tier: "inactive", label: "Inactive" },
];

function hasActiveFilters(values: MemberSearchInput): boolean {
  return Boolean(values.q || values.status || values.rolePreset || values.engagementTier);
}

/**
 * MemberCore directory toolbar — search, filters, and quick presets.
 */
export function MemberDirectoryFilters({ orgSlug, values, action }: Props) {
  const formAction = action ?? `/${orgSlug}/members`;
  const base = `/${orgSlug}/members`;
  const active = hasActiveFilters(values);

  return (
    <section className="mc-toolbar pp-readable-on-light" aria-label="Member directory filters">
      <div className="mc-toolbar-intro">
        <p className="mc-toolbar-title">Find members</p>
        <p className="mc-toolbar-hint">
          Search the directory, then narrow by status, leadership role, or engagement tier.
        </p>
      </div>

      <form className="mc-toolbar-form" method="get" action={formAction}>
        <fieldset className="border-0 p-0 m-0">
          <legend className="sr-only">Search and filter members</legend>

          <div className="mc-toolbar-search-row">
            <label className="mc-field mc-field--grow">
              <span className="mc-field-label">Search</span>
              <input
                name="q"
                type="search"
                placeholder="Name or email"
                defaultValue={values.q ?? ""}
                className="mc-input"
                autoComplete="off"
                aria-label="Search members by name or email"
              />
            </label>
            <label className="mc-field">
              <span className="mc-field-label">Status</span>
              <select
                name="status"
                defaultValue={values.status ?? ""}
                className="mc-select"
                aria-label="Membership status"
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="LAPSED">Lapsed</option>
              </select>
            </label>
          </div>

          <div className="mc-toolbar-filter-grid">
            <label className="mc-field">
              <span className="mc-field-label">Role type</span>
              <select
                id="rolePreset"
                name="rolePreset"
                defaultValue={values.rolePreset ?? ""}
                className="mc-select"
                aria-label="Filter by role type"
              >
                <option value="">Any role</option>
                {Object.entries(ROLE_FILTER_PRESET_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mc-field">
              <span className="mc-field-label">Role match</span>
              <select
                id="roleMode"
                name="roleMode"
                defaultValue={values.roleMode ?? "include"}
                className="mc-select"
                aria-label="Include or exclude selected role"
              >
                {Object.entries(ROLE_FILTER_MODE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mc-field">
              <span className="mc-field-label">Engagement</span>
              <select
                name="engagementTier"
                defaultValue={values.engagementTier ?? ""}
                className="mc-select"
                aria-label="Engagement tier"
              >
                <option value="">Any engagement</option>
                {Object.entries(ENGAGEMENT_TIER_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mc-toolbar-actions">
              <button type="submit" className="pc-btn-primary text-sm">
                Apply filters
              </button>
              {active ? (
                <Link href={base} className="pc-btn-secondary text-sm">
                  Clear all
                </Link>
              ) : null}
            </div>
          </div>
        </fieldset>
      </form>

      <div className="mc-toolbar-quick">
        <div className="mc-toolbar-quick-group">
          <span className="mc-toolbar-quick-label">Quick filters · leadership</span>
          <div className="mc-toolbar-chips">
            {QUICK_ROLE_FILTERS.map(({ preset, label }) => {
              const isActive =
                values.rolePreset === preset && (values.roleMode ?? "include") === "include";
              const href = `${base}${memberSearchToQueryString({
                ...values,
                rolePreset: preset,
                roleMode: "include",
                engagementTier: undefined,
              })}`;
              return (
                <Link
                  key={preset}
                  href={href}
                  className={`mc-chip${isActive ? " mc-chip--active" : ""}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mc-toolbar-quick-group">
          <span className="mc-toolbar-quick-label">Quick filters · engagement</span>
          <div className="mc-toolbar-chips">
            {QUICK_ENGAGEMENT.map(({ tier, label }) => {
              const isActive = values.engagementTier === tier;
              const href = `${base}${memberSearchToQueryString({
                ...values,
                engagementTier: tier,
                rolePreset: undefined,
                roleMode: undefined,
              })}`;
              return (
                <Link
                  key={tier}
                  href={href}
                  className={`mc-chip mc-chip--engage${isActive ? " mc-chip--active" : ""}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
