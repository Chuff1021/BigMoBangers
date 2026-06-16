import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship raw TS — transpile them in the Next build.
  transpilePackages: ["@bangers/db", "@bangers/types"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
