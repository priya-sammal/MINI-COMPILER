import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/MINI-COMPILER",
  assetPrefix: "/MINI-COMPILER/",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
