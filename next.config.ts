import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash (demo listing photos)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Common MLS/RESO media CDNs
      { protocol: "https", hostname: "*.mlslistings.com" },
      { protocol: "https", hostname: "*.paragonrels.com" },
      { protocol: "https", hostname: "*.cdnlistings.com" },
      { protocol: "https", hostname: "*.niagara-mls.ca" },
      // Wildcard fallback for any https image (production will narrow this)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
