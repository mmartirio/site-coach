import { Analytics, BotaoCookies } from "@/components/Analytics";
import { SiteView } from "@/components/site/SiteView";
import { lerSite } from "@/lib/armazenamento";
import { dadosEstruturados, jsonLd, urlBase } from "@/lib/seo";

// O conteúdo vem do painel (data/site.json), então a página é montada a cada acesso.
export const dynamic = "force-dynamic";

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
