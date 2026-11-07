import type { MetadataRoute } from "next";
import { dataDoConteudo, lerSite } from "@/lib/armazenamento";
import { urlBase } from "@/lib/seo";

export const dynamic = "force-dynamic";

// /sitemap.xml — enviar este endereço no Google Search Console.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await lerSite();
  return [{ url: `${await urlBase(site)}/`, lastModified: await dataDoConteudo(), changeFrequency: "weekly", priority: 1 }];
}
