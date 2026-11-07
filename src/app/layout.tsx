import type { Metadata, Viewport } from "next";
import { lerSite } from "@/lib/armazenamento";
import { imagemCompartilhamento, urlBase } from "@/lib/seo";
import { arquivoParaPreload, cssDasFontes } from "@/lib/fontes-css";
import { varsDoTema } from "@/lib/utils";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await lerSite();
  const { info, seo } = site;
  const base = await urlBase(site);
  const titulo = info.titulo ? `${info.nome} | ${info.titulo}` : info.nome;
  const imagem = imagemCompartilhamento(site);

  return {
    metadataBase: new URL(base),
    title: titulo,
    description: info.descricao,
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "/",
      siteName: info.nome,
      title: titulo,
      description: info.descricao,
      images: [{ url: imagem, width: 1200, height: 630, alt: titulo }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: info.descricao, images: [imagem] },
    verification: seo.googleVerificacao ? { google: seo.googleVerificacao } : undefined,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { tema } = await lerSite();
  return { themeColor: tema.corPrimaria };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { tema } = await lerSite();
  const css = cssDasFontes([tema.fonteTitulos, tema.fonteTexto]);
  const preloadTitulos = arquivoParaPreload(tema.fonteTitulos);
  return (
    <html lang="pt-BR" style={varsDoTema(tema)}>
      <head>
        {preloadTitulos && <link rel="preload" href={preloadTitulos} as="font" type="font/woff2" crossOrigin="" />}
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      </head>
      <body>{children}</body>
    </html>
  );
}
