import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/uploads/**" }, { pathname: "/imagens/**" }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
