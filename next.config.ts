import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep builds scoped to this app when the checkout sits inside another workspace.
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
};

export default nextConfig;

