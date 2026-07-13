import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosting (Hostinger VPS): emit a lean standalone server.
  output: "standalone",
  outputFileTracingIncludes: {
    // Ship the Prisma query engine + schema so migrations run at container start.
    "/": ["./prisma/**", "./src/generated/**"],
  },
};

export default nextConfig;
