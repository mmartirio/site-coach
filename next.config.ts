import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor enxuto em .next/standalone, usado pela imagem Docker.
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // só otimiza imagens do próprio site (enviadas pelo painel e as de exemplo)
    localPatterns: [{ pathname: "/uploads/**" }, { pathname: "/imagens/**" }],
    // nomes de upload são únicos (UUID), então o resultado otimizado pode ficar em cache por muito tempo
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
