import type { MetadataRoute } from "next";
import { lerSite } from "@/lib/armazenamento";
import { urlBase } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await urlBase(await lerSite());
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
