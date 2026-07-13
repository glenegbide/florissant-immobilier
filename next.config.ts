import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosting (Hostinger VPS): emit a lean standalone server.
  output: "standalone",
  outputFileTracingIncludes: {
    // Ship the Prisma query engine + schema so migrations run at container start.
    "/": ["./prisma/**", "./src/generated/**"],
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
