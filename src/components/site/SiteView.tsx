import type { Site } from "@/lib/schema";
import { whatsappLink } from "@/lib/utils";
import { Imagem } from "./Imagem";
import { Paragrafos } from "./Paragrafos";
import { Blocos, SecaoView } from "./Secoes";

/** rodapeExtra: conteúdo extra no rodapé (ex.: link de preferências de cookies, só no site público). */
export function SiteView({ site, rodapeExtra }: { site: Site; rodapeExtra?: React.ReactNode }) {
  const secoes = site.secoes.filter((s) => s.visivel);
  const menu = secoes.filter((s) => s.noMenu && s.titulo);
  const { info, topo } = site;

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <a href="#inicio" className="logo">
            {info.nome}
          </a>
          <nav aria-label="Navegação principal">
            {menu.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={s.tipo === "contato" ? "btn btn--small" : undefined}>
                {s.tipo === "contato" ? "Contato" : s.titulo}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className={`container ${topo.imagem ? "hero__grid" : ""}`}>
            <div>
              {topo.rotulo && <p className="eyebrow">{topo.rotulo}</p>}
              <h1>{topo.titulo}</h1>
              <Blocos blocos={topo.blocos.filter((b) => b.posicao === "antes")} whatsapp={info.whatsapp} />
              <Paragrafos texto={topo.subtitulo} className="hero__lead" />
              <div className="acoes">
                {info.whatsapp && topo.botaoTexto && (
                  <a className="btn" href={whatsappLink(info.whatsapp, topo.mensagemWhatsapp)} target="_blank" rel="noopener noreferrer">
                    {topo.botaoTexto}
                  </a>
                )}
                {menu[0] && (
                  <a className="btn btn--ghost" href={`#${menu[0].id}`}>
                    Saiba mais
                  </a>
                )}
              </div>
              {topo.blocos.some((b) => b.posicao === "depois") && (
                <div className="blocos--depois">
                  <Blocos blocos={topo.blocos.filter((b) => b.posicao === "depois")} whatsapp={info.whatsapp} />
                </div>
              )}
            </div>
            {topo.imagem && <Imagem className="hero__imagem" src={topo.imagem} sizes="(max-width: 760px) 90vw, 45vw" largura={800} altura={1000} preload />}
          </div>
        </section>

        {secoes.map((s) => (
          <SecaoView key={s.id} secao={s} site={site} />
        ))}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span>
            {site.rodape || `© ${new Date().getFullYear()} ${info.nome}${info.titulo ? ` · ${info.titulo}` : ""}`}
          </span>
          <span className="footer__links">
            {info.instagram && (
              <a href={info.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {rodapeExtra}
          </span>
        </div>
      </footer>
    </>
  );
}
