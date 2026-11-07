import { headers } from "next/headers";
import type { Site } from "./schema";

const semBarraFinal = (u: string) => u.replace(/\/+$/, "");

/**
 * Endereço público do site, nesta ordem: campo do painel, variável SITE_URL, ou o host da requisição.
 * O ideal é preencher no painel: o Google usa esse endereço no sitemap e no link canônico.
 */
export async function urlBase(site: Site): Promise<string> {
  if (site.seo.urlSite) return semBarraFinal(site.seo.urlSite);
  if (process.env.SITE_URL && /^https?:\/\/[a-z0-9.-]+(:\d+)?\/?$/i.test(process.env.SITE_URL)) return semBarraFinal(process.env.SITE_URL);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  if (!/^[a-z0-9.-]+(:\d+)?$/i.test(host)) return "http://localhost:3010"; // ignora Host malformado
  const proto = h.get("x-forwarded-proto") === "https" || !/^(localhost|127\.|\[::1\])/.test(host) ? "https" : "http";
  return `${proto}://${host}`;
}

/** Imagem de compartilhamento: a escolhida no painel, a foto do topo ou a imagem gerada em /og. */
export function imagemCompartilhamento(site: Site): string {
  return site.seo.imagemCompartilhamento || site.topo.imagem || "/og";
}

const absoluta = (base: string, u: string) => (/^https?:\/\//.test(u) ? u : `${base}${u.startsWith("/") ? "" : "/"}${u}`);

/** Dados estruturados (schema.org) para o Google entender que é um serviço profissional de coaching. */
export function dadosEstruturados(site: Site, base: string) {
  const { info } = site;
  const servicos = site.secoes
    .filter((s) => s.visivel && (s.tipo === "cards" || s.tipo === "eventos"))
    .flatMap((s) => ("itens" in s ? s.itens : []))
    .filter((i) => i.titulo)
    .slice(0, 20);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${base}/#negocio`,
    name: info.nome,
    description: info.descricao || undefined,
    url: `${base}/`,
    image: absoluta(base, imagemCompartilhamento(site)),
    email: info.email || undefined,
    telephone: info.whatsapp ? `+${info.whatsapp}` : undefined,
    sameAs: info.instagram ? [info.instagram] : undefined,
    areaServed: { "@type": "Country", name: "Brasil" },
    founder: { "@type": "Person", name: info.nome, jobTitle: info.titulo || undefined },
    hasOfferCatalog: servicos.length
      ? {
          "@type": "OfferCatalog",
          name: "Serviços",
          itemListElement: servicos.map((i) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: i.titulo, description: i.texto || undefined },
            ...(i.link ? { url: absoluta(base, i.link) } : {}),
          })),
        }
      : undefined,
  };
}

/** JSON seguro para <script type="application/ld+json"> (impede fechar a tag com "</script>"). */
export function jsonLd(dados: unknown): string {
  return JSON.stringify(dados).replace(/</g, "\\u003c");
}
