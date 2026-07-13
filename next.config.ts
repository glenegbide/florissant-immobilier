import type { NextConfig } from "next";

// English public slugs → the French file-system routes that serve them.
// Keep in sync with src/lib/routes.ts.
const enSlugs: Array<[en: string, fr: string]> = [
  ["buy", "acheter"],
  ["rent", "louer"],
  ["sell", "vendre"],
  ["valuation", "estimer"],
  ["properties", "biens"],
  ["about", "a-propos"],
  ["legal", "mentions-legales"],
  ["privacy", "confidentialite"],
];

const nextConfig: NextConfig = {
  // Self-hosting (Hostinger VPS): emit a lean standalone server.
  output: "standalone",
  images: {
    // Qualities used by <Image quality={…}> across the site.
    qualities: [75, 90],
  },
  outputFileTracingIncludes: {
    // Ship the Prisma query engine + schema so migrations run at container start.
    "/": ["./prisma/**", "./src/generated/**"],
  },
  async rewrites() {
    return enSlugs.map(([en, fr]) => ({
      source: `/en/${en}`,
      destination: `/en/${fr}`,
    }));
  },
  async redirects() {
    return [
      // Old English URLs used the French slugs.
      ...enSlugs.map(([en, fr]) => ({
        source: `/en/${fr}`,
        destination: `/en/${en}`,
        permanent: true,
      })),
      // The Prestige page was retired.
      { source: "/fr/prestige", destination: "/fr", permanent: true },
      { source: "/en/prestige", destination: "/en", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
