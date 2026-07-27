import type { NextConfig } from "next";

const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGhPages
    ? {
        output: "export" as const,
        basePath: "/pulsepoint",
        assetPrefix: "/pulsepoint/",
        trailingSlash: true,
        images: { unoptimized: true },
        distDir: process.env.NEXT_DIST_DIR || ".next-gh-pages",
        // Marketing-only tree moves `app/actions` aside; skip full-repo tsc for this export.
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  env: {
    NEXT_PUBLIC_GITHUB_PAGES: isGhPages ? "true" : "",
  },
  ...(isGhPages
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=()",
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
