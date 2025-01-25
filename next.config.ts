import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? "/web2" : "",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
