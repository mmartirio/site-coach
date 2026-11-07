import type { MetadataRoute } from "next";
import { dataDoConteudo, lerSite } from "@/lib/armazenamento";
import { urlBase } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await lerSite();
  const base = await urlBase(site);
  const lastModified = await dataDoConteudo();
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/cookies`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
