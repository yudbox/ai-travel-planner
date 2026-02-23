import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ai-proxy.lab.epam.com",
        pathname: "/v1/files/**",
      },
    ],
    // Enable optimization for all image formats
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
