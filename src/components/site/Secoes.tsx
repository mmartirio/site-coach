import type { Bloco, Item, Secao, Site } from "@/lib/schema";
import { Icone } from "@/lib/icones";
import { atributosLink, hrefDoBotao, linkExterno, whatsappLink } from "@/lib/utils";
import { Galeria } from "./Galeria";
import { Imagem } from "./Imagem";
import { Paragrafos } from "./Paragrafos";

type Props<T extends Secao["tipo"]> = { secao: Extract<Secao, { tipo: T }>; site: Site };

const CLASSE_FUNDO = { claro: "", suave: "section--alt", destaque: "section--cta" } as const;

export function Blocos({ blocos, whatsapp }: { blocos: Bloco[]; whatsapp: string }) {
  if (blocos.length === 0) return null;
  return (
    <div className="blocos">
      {blocos.map((b) => {
        switch (b.tipo) {
          case "subtitulo":
            return b.texto ? <h3 key={b.id} className="bloco-subtitulo">{b.texto}</h3> : null;
          case "texto":
            return (
              <div key={b.id} className="bloco-texto">
                <Paragrafos texto={b.texto} />
              </div>
            );
          case "botao": {
            const href = hrefDoBotao(b.destino, b.link, b.mensagemWhatsapp, whatsapp);
            return href && b.texto ? (
              <div key={b.id} className="bloco-botao">
                <a className={`btn ${b.estilo === "contorno" ? "btn--ghost" : ""}`} href={href} {...atributosLink(href)}>
                  {b.texto}
                </a>
              </div>
            ) : null;
          }
          case "imagem":
            return b.imagem ? (
              <figure key={b.id} className={`bloco-imagem ${b.largura === "larga" ? "bloco-imagem--larga" : ""}`}>
                <Imagem src={b.imagem} alt={b.legenda} sizes={b.largura === "larga" ? "(max-width: 1100px) 100vw, 1100px" : "(max-width: 800px) 100vw, 760px"} />
                {b.legenda && <figcaption>{b.legenda}</figcaption>}
              </figure>
            ) : null;
        }
      })}
    </div>
  );
}

function Cabecalho({ secao, site, introducao }: { secao: Secao; site: Site; introducao?: string }) {
  return (
    <>
      {secao.titulo && <h2>{secao.titulo}</h2>}
      <Blocos blocos={secao.blocos.filter((b) => b.posicao === "antes")} whatsapp={site.info.whatsapp} />
      {introducao && <Paragrafos texto={introducao} className="secao__intro" />}
    </>
  );
}

function SecaoTexto({ secao, site }: Props<"texto">) {
  return (
    <div className={`container texto-imagem ${secao.imagem ? "" : "texto-imagem--sem-imagem"} ${secao.imagemLado === "direita" ? "texto-imagem--direita" : ""}`}>
      {secao.imagem && <Imagem className="texto-imagem__foto" src={secao.imagem} sizes="(max-width: 760px) 180px, 280px" largura={600} altura={600} />}
      <div>
        <Cabecalho secao={secao} site={site} />
        <Paragrafos texto={secao.texto} />
      </div>
    </div>
  );
}

function SecaoCards({ secao, site }: Props<"cards">) {
  return (
    <div className="container">
      <Cabecalho secao={secao} site={site} introducao={secao.introducao} />
      <div className="cards">
        {secao.itens.map((c) => (
          <article key={c.id} className="card">
            {c.imagem && <Imagem className="card__imagem" src={c.imagem} sizes="(max-width: 760px) 100vw, 380px" largura={800} altura={450} />}
            {c.icone && (
              <span className="card__icone">
                <Icone nome={c.icone} />
              </span>
            )}
            <h3>{c.titulo}</h3>
            <Paragrafos texto={c.texto} />
            {c.lista.some((l) => l.trim()) && (
              <ul>
                {c.lista.filter((l) => l.trim()).map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function CardClicavel({ link, rotulo, className, children }: { link: string; rotulo: string; className: string; children: React.ReactNode }) {
  if (!link) return <article className={className}>{children}</article>;
  const externo = linkExterno(link);
  return (
    <a
      className={`${className} evento--link`}
      href={link}
      aria-label={rotulo}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

const NOME_FORMATO = { palestra: "Palestra", treinamento: "Treinamento" } as const;

function CardEvento({ item: ev, acao }: { item: Item; acao: string }) {
  const topicos = ev.lista.filter((l) => l.trim());
  return (
    <CardClicavel link={ev.link} rotulo={`${NOME_FORMATO[ev.formato]} ${ev.titulo}: ${acao}`} className="evento">
      <div className="evento__imagem">
        {ev.imagem ? <Imagem src={ev.imagem} sizes="(max-width: 760px) 100vw, 380px" largura={800} altura={450} /> : <Icone nome={ev.formato === "treinamento" ? "presentation" : "mic"} tamanho={56} className="evento__sem-imagem" />}
        <span className="evento__selo">{NOME_FORMATO[ev.formato]}</span>
      </div>
      <div className="evento__corpo">
        {(ev.data || ev.local || ev.duracao) && (
          <p className="evento__meta">
            {ev.data && <span><Icone nome="calendar" tamanho={16} /> {ev.data}</span>}
            {ev.local && <span><Icone nome="map-pin" tamanho={16} /> {ev.local}</span>}
            {ev.duracao && <span><Icone nome="clock" tamanho={16} /> {ev.duracao}</span>}
          </p>
        )}
        <h3>{ev.titulo}</h3>
        <Paragrafos texto={ev.texto} />
        {topicos.length > 0 && (
          <>
            <p className="evento__subtitulo">O que você vai aprender</p>
            <ul className="evento__topicos">
              {topicos.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </>
        )}
        <div className="evento__rodape">
          {ev.preco && <strong className="evento__preco">{ev.preco}</strong>}
          <span className={`evento__acao ${ev.link ? "" : "evento__acao--off"}`}>
            {ev.link ? `${acao} →` : "Inscrições em breve"}
          </span>
        </div>
      </div>
    </CardClicavel>
  );
}

function SecaoEventos({ secao, site }: Props<"eventos">) {
  const acao = secao.botaoTexto || "Inscreva-se";
  return (
    <div className="container">
      <Cabecalho secao={secao} site={site} introducao={secao.introducao} />
      <div className="eventos">
        {secao.itens.map((it) => (
          <CardEvento key={it.id} item={it} acao={acao} />
        ))}
      </div>
    </div>
  );
}

function SecaoGaleria({ secao, site }: Props<"galeria">) {
  const fotos = secao.itens.filter((f) => f.imagem).map((f) => ({ id: f.id, src: f.imagem, legenda: f.titulo }));
  return (
    <div className="container">
      <Cabecalho secao={secao} site={site} introducao={secao.introducao} />
      {fotos.length > 0 ? <Galeria fotos={fotos} /> : <p className="secao__intro">Nenhuma foto adicionada ainda.</p>}
    </div>
  );
}

function SecaoEtapas({ secao, site }: Props<"etapas">) {
  return (
    <div className="container">
      <Cabecalho secao={secao} site={site} introducao={secao.introducao} />
      <ol className="etapas">
        {secao.itens.map((e) => (
          <li key={e.id}>
            <h3>{e.titulo}</h3>
            <Paragrafos texto={e.texto} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function SecaoContato({ secao, site }: Props<"contato">) {
  const destaque = secao.fundo === "destaque";
  return (
    <div className="container contato">
      <Cabecalho secao={secao} site={site} />
      <Paragrafos texto={secao.texto} />
      <div className="acoes">
        {site.info.whatsapp && (
          <a
            className={`btn ${destaque ? "btn--light" : ""}`}
            href={whatsappLink(site.info.whatsapp, secao.mensagemWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {secao.botaoTexto || "Falar no WhatsApp"}
          </a>
        )}
        {site.info.email && (
          <a className={`btn ${destaque ? "btn--ghost-light" : "btn--ghost"}`} href={`mailto:${site.info.email}`}>
            {site.info.email}
          </a>
        )}
      </div>
    </div>
  );
}

function SecaoCta({ secao, site }: Props<"cta">) {
  const destaque = secao.fundo === "destaque";
  const href = hrefDoBotao(secao.destino, secao.link, secao.mensagemWhatsapp, site.info.whatsapp);
  return (
    <div className="container contato cta">
      <Cabecalho secao={secao} site={site} />
      <Paragrafos texto={secao.texto} />
      <div className="acoes">
        {href && secao.botaoTexto && (
          <a className={`btn ${destaque ? "btn--light" : ""}`} href={href} {...atributosLink(href)}>
            {secao.botaoTexto}
          </a>
        )}
        {secao.botao2Texto && secao.botao2Link && (
          <a className={`btn ${destaque ? "btn--ghost-light" : "btn--ghost"}`} href={secao.botao2Link} {...atributosLink(secao.botao2Link)}>
            {secao.botao2Texto}
          </a>
        )}
      </div>
    </div>
  );
}

export function SecaoView({ secao, site }: { secao: Secao; site: Site }) {
  const depois = secao.blocos.filter((b) => b.posicao === "depois");
  let corpo;
  switch (secao.tipo) {
    case "texto": corpo = <SecaoTexto secao={secao} site={site} />; break;
    case "cards": corpo = <SecaoCards secao={secao} site={site} />; break;
    case "eventos": corpo = <SecaoEventos secao={secao} site={site} />; break;
    case "galeria": corpo = <SecaoGaleria secao={secao} site={site} />; break;
    case "etapas": corpo = <SecaoEtapas secao={secao} site={site} />; break;
    case "cta": corpo = <SecaoCta secao={secao} site={site} />; break;
    case "contato": corpo = <SecaoContato secao={secao} site={site} />; break;
  }
  return (
    <section id={secao.id} className={`section ${CLASSE_FUNDO[secao.fundo]}`}>
      {corpo}
      {depois.length > 0 && (
        <div className={`container blocos--depois ${secao.tipo === "contato" ? "contato" : ""}`}>
          <Blocos blocos={depois} whatsapp={site.info.whatsapp} />
        </div>
      )}
    </section>
  );
}
