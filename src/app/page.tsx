import dynamicImport from "next/dynamic";
import { BotaoCookies } from "@/components/BotaoCookies";
import { SiteView } from "@/components/site/SiteView";
import { lerSite } from "@/lib/armazenamento";
import { dadosEstruturados, jsonLd, urlBase } from "@/lib/seo";

export const dynamic = "force-dynamic";

const Analytics = dynamicImport(() => import("@/components/Analytics").then((m) => m.Analytics));

export default async function Home() {
  const site = await lerSite();
  const ga = site.seo.googleAnalyticsId;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(dadosEstruturados(site, await urlBase(site))) }} />
      <SiteView site={site} rodapeExtra={ga ? <BotaoCookies /> : null} />
      {ga && <Analytics id={ga} />}
    </>
  );
}
