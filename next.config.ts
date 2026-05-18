import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.mlslistings.com" },
      { protocol: "https", hostname: "*.paragonrels.com" },
      { protocol: "https", hostname: "*.cdnlistings.com" },
      { protocol: "https", hostname: "*.niagara-mls.ca" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        // Never cache HTML pages — always fetch fresh so new JS bundles load
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
