/**
 * GitHub Pages static marketing export.
 * Set GITHUB_PAGES=true (and NEXT_PUBLIC_GITHUB_PAGES=true) during `pnpm build:gh-pages`.
 */

export function isGitHubPagesBuild(): boolean {
  return (
    process.env.GITHUB_PAGES === "true" ||
    process.env.NEXT_PUBLIC_GITHUB_PAGES === "true"
  );
}
