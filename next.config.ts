import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    minimumCacheTTL: 60 * 60 * 24,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.enter.pro",
        pathname: "/resources/**",
      },
    ],
  },
};

export default nextConfig;
