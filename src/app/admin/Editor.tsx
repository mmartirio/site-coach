"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { SiteView } from "@/components/site/SiteView";
import { NOMES_BLOCO, nomeDoTipo, novaSecao, novoBloco, novoId, novoItem } from "@/lib/conteudo-padrao";
import { CHAVES_FONTES, FONTES } from "@/lib/fontes";
import { aplicarTema, TEMAS, temaAtivo } from "@/lib/temas";
import type { Bloco, Item, Secao, Site, Tema, TipoBloco, TipoSecao } from "@/lib/schema";
import { cssDasFontes } from "@/lib/fontes-css";
import { varsDoTema } from "@/lib/utils";
import { sair, salvar } from "./actions";
import { Alternar, Campo, CampoArea, CampoCor, CampoImagem, CampoTexto, enviarImagem, SeletorIcone } from "./Campos";

type Aba = "secoes" | "aparencia" | "info";
const ABAS: { id: Aba; nome: string }[] = [
  { id: "secoes", nome: "Seções" },
  { id: "aparencia", nome: "Cores e fontes" },
  { id: "info", nome: "Informações" },
];

type Editar = (fn: (s: Site) => void) => void;

function mover<T>(lista: T[], de: number, para: number) {
  if (para < 0 || para >= lista.length) return;
  const [x] = lista.splice(de, 1);
  lista.splice(para, 0, x);
}

export function Editor({ inicial }: { inicial: Site }) {
  const [site, setSite] = useState(inicial);
  const [salvo, setSalvo] = useState(() => JSON.stringify(inicial));
  const [aba, setAba] = useState<Aba>("secoes");
  const [status, setStatus] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);
  const [salvando, iniciarSalvar] = useTransition();
  const sujo = JSON.stringify(site) !== salvo;

  const editar: Editar = (fn) => {
    setStatus(null);
    setSite((s) => {
      const n = structuredClone(s);
      fn(n);
      return n;
    });
  };

  function salvarAgora() {
    iniciarSalvar(async () => {
      const r = await salvar(site);
      if (r.ok) {
        setSalvo(JSON.stringify(site));
        setStatus({ tipo: "ok", msg: "Alterações publicadas no site." });
      } else {
        setStatus({ tipo: "erro", msg: r.erro });
      }
    });
  }

  useEffect(() => {
    const aoSair = (e: BeforeUnloadEvent) => {
      if (sujo) e.preventDefault();
    };
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (sujo && !salvando) salvarAgora();
      }
    };
    window.addEventListener("beforeunload", aoSair);
    window.addEventListener("keydown", atalho);
    return () => {
      window.removeEventListener("beforeunload", aoSair);
      window.removeEventListener("keydown", atalho);
    };
  });

  return (
    <div className="adm-painel">
      <header className="adm-topo">
        <strong>Painel do site</strong>
        <div className="adm-topo__acoes">
          {status && <span className={`adm-status adm-status--${status.tipo}`}>{status.msg}</span>}
          {!status && sujo && <span className="adm-status">Alterações não salvas</span>}
          <button
            type="button"
            className="adm-btn"
            disabled={!sujo || salvando}
            onClick={() => confirm("Descartar todas as alterações não salvas?") && setSite(JSON.parse(salvo))}
          >
            Descartar
          </button>
          <button type="button" className="adm-btn adm-btn--primario" disabled={!sujo || salvando} onClick={salvarAgora}>
            {salvando ? "Salvando..." : "Salvar e publicar"}
          </button>
          <a className="adm-btn" href="/" target="_blank" rel="noopener noreferrer">
            Ver site ↗
          </a>
          <form action={sair}>
            <button type="submit" className="adm-btn adm-btn--texto">
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="adm-corpo">
        <aside className="adm-lateral">
          <nav className="adm-abas">
            {ABAS.map((a) => (
              <button key={a.id} type="button" className={aba === a.id ? "ativa" : ""} onClick={() => setAba(a.id)}>
                {a.nome}
              </button>
            ))}
          </nav>
          <div className="adm-formulario">
            {aba === "secoes" && <AbaSecoes site={site} editar={editar} />}
            {aba === "aparencia" && <AbaAparencia tema={site.tema} editar={editar} />}
            {aba === "info" && <AbaInfo site={site} editar={editar} />}
          </div>
        </aside>

        <section className="adm-preview" aria-label="Pré-visualização">
          <div className="adm-preview__rotulo">Pré-visualização (atualiza enquanto você edita)</div>
          <style dangerouslySetInnerHTML={{ __html: cssDasFontes(CHAVES_FONTES) }} />
          <div className="adm-preview__site site-raiz" style={varsDoTema(site.tema)}>
            <SiteView site={site} />
          </div>
        </section>
      </div>
    </div>
  );
}

const CORES: { chave: keyof Tema; nome: string }[] = [
  { chave: "corPrimaria", nome: "Cor principal (botões, títulos)" },
  { chave: "corPrimariaEscura", nome: "Cor principal escura" },
  { chave: "corDestaque", nome: "Cor de destaque (detalhes)" },
  { chave: "corTexto", nome: "Texto" },
  { chave: "corTextoSuave", nome: "Texto secundário" },
  { chave: "corFundo", nome: "Fundo" },
  { chave: "corFundoSuave", nome: "Fundo alternativo" },
  { chave: "corCartao", nome: "Fundo dos cards" },
  { chave: "corTitulos", nome: "Títulos" },
  { chave: "corTextoBotao", nome: "Texto dos botões" },
];

function AbaAparencia({ tema, editar }: { tema: Tema; editar: Editar }) {
  const ativo = temaAtivo(tema);
  return (
    <>
      <h2>Tema de cores</h2>
      <p className="adm-ajuda">Escolha um tema para trocar todas as cores do site de uma vez. As fontes não mudam.</p>
      {([false, true] as const).map((escuro) => (
        <div key={String(escuro)}>
          <h3 className="adm-temas__grupo">{escuro ? "Escuros" : "Claros"}</h3>
          <div className="adm-temas">
            {TEMAS.filter((t) => t.escuro === escuro).map((t) => (
              <button
                key={t.id}
                type="button"
                className={`adm-tema ${ativo?.id === t.id ? "ativo" : ""}`}
                aria-pressed={ativo?.id === t.id}
                onClick={() => editar((s) => void (s.tema = aplicarTema(s.tema, t)))}
              >
                <span className="adm-tema__amostra" style={{ background: t.cores.corFundo }}>
                  <span className="adm-tema__card" style={{ background: t.cores.corCartao, borderColor: `${t.cores.corPrimaria}33` }}>
                    <span style={{ background: t.cores.corTitulos }} />
                    <span style={{ background: t.cores.corTextoSuave }} />
                  </span>
                  <span className="adm-tema__botao" style={{ background: t.cores.corPrimaria }} />
                  <span className="adm-tema__ponto" style={{ background: t.cores.corDestaque }} />
                </span>
                <span className="adm-tema__nome">{t.nome}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <details className="adm-personalizar" open={!ativo}>
        <summary>{ativo ? "Personalizar cores" : "Cores personalizadas"}</summary>
        <p className="adm-ajuda">Ajuste cor por cor a partir do tema escolhido.</p>
        <div className="adm-cores">
          {CORES.map((c) => (
            <CampoCor
              key={c.chave}
              rotulo={c.nome}
              valor={tema[c.chave] as string}
              onChange={(v) => editar((s) => void ((s.tema[c.chave] as string) = v))}
            />
          ))}
        </div>
      </details>

      <h2>Fontes</h2>
      {(["fonteTitulos", "fonteTexto"] as const).map((campo) => (
        <Campo key={campo} rotulo={campo === "fonteTitulos" ? "Fonte dos títulos" : "Fonte do texto"}>
          <select value={tema[campo]} onChange={(e) => editar((s) => void (s.tema[campo] = e.target.value as Tema[typeof campo]))}>
            {CHAVES_FONTES.map((f) => (
              <option key={f} value={f}>
                {FONTES[f].nome}
              </option>
            ))}
          </select>
        </Campo>
      ))}
    </>
  );
}

function AbaInfo({ site, editar }: { site: Site; editar: Editar }) {
  const { info } = site;
  const campo = (k: keyof Site["info"]) => (v: string) => editar((s) => void (s.info[k] = v));
  return (
    <>
      <h2>Informações gerais</h2>
      <CampoTexto rotulo="Nome (aparece no topo do site)" valor={info.nome} onChange={campo("nome")} />
      <CampoTexto rotulo="Título profissional" valor={info.titulo} onChange={campo("titulo")} />
      <CampoArea
        rotulo="Descrição para o Google"
        dica="Texto curto que aparece nos resultados de busca e ao compartilhar o link."
        linhas={2}
        valor={info.descricao}
        onChange={campo("descricao")}
      />
      <h2>Contato</h2>
      <CampoTexto
        rotulo="WhatsApp"
        dica="Só números, com DDI e DDD. Ex.: 5511999999999"
        valor={info.whatsapp}
        onChange={(v) => campo("whatsapp")(v.replace(/\D/g, ""))}
      />
      <CampoTexto rotulo="E-mail" tipo="email" valor={info.email} onChange={campo("email")} />
      <CampoTexto rotulo="Instagram (link completo)" placeholder="https://instagram.com/..." valor={info.instagram} onChange={campo("instagram")} />
      <CampoTexto
        rotulo="Texto do rodapé"
        dica="Deixe vazio para usar “© ano + nome”."
        valor={site.rodape}
        onChange={(v) => editar((s) => void (s.rodape = v))}
      />
      <CamposGoogle site={site} editar={editar} />
    </>
  );
}

function codigoDeVerificacao(v: string) {
  const meta = v.match(/content\s*=\s*["']([^"']+)["']/i);
  return (meta ? meta[1] : v).trim();
}

function CamposGoogle({ site, editar }: { site: Site; editar: Editar }) {
  const { seo } = site;
  const campo = (k: keyof Site["seo"]) => (v: string) => editar((s) => void (s.seo[k] = v));
  const base = (seo.urlSite || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/+$/, "");
  return (
    <>
      <h2>Google e compartilhamento</h2>
      <CampoTexto
        rotulo="Endereço do site"
        dica="O endereço oficial, com https. Usado pelo Google (sitemap e link canônico) e ao compartilhar o link."
        placeholder="https://www.seusite.com.br"
        tipo="url"
        valor={seo.urlSite}
        onChange={(v) => campo("urlSite")(v.trim())}
      />
      <CampoTexto
        rotulo="Google Search Console: código de verificação"
        dica="No Search Console, escolha verificar por “Tag HTML” e cole aqui a tag inteira ou só o código do content."
        placeholder='<meta name="google-site-verification" content="...">'
        valor={seo.googleVerificacao}
        onChange={(v) => campo("googleVerificacao")(codigoDeVerificacao(v))}
      />
      <p className="adm-ajuda">
        Depois de verificar, envie o sitemap no Search Console: <code>{base}/sitemap.xml</code>
      </p>
      <CampoTexto
        rotulo="Google Analytics: ID de medição"
        dica="Em Analytics › Administrador › Fluxos de dados. Formato G-XXXXXXXXXX. O site só ativa o Analytics para quem aceitar os cookies."
        placeholder="G-XXXXXXXXXX"
        valor={seo.googleAnalyticsId}
        onChange={(v) => campo("googleAnalyticsId")(v.trim().toUpperCase())}
      />
      <CampoImagem rotulo="Imagem ao compartilhar o link (1200 × 630)" valor={seo.imagemCompartilhamento} onChange={campo("imagemCompartilhamento")} />
      <p className="adm-ajuda">
        Sem imagem aqui, o site usa a foto do topo; sem foto no topo, gera uma imagem com seu nome e as cores do tema.
      </p>
    </>
  );
}

function CamposTopo({ site, editar }: { site: Site; editar: Editar }) {
  const { topo } = site;
  const campo = (k: Exclude<keyof Site["topo"], "blocos">) => (v: string) => editar((s) => void (s.topo[k] = v));
  return (
    <>
      <CampoTexto rotulo="Texto pequeno acima do título" valor={topo.rotulo} onChange={campo("rotulo")} />
      <CampoTexto rotulo="Título principal" valor={topo.titulo} onChange={campo("titulo")} />
      <CampoArea rotulo="Subtítulo" linhas={3} valor={topo.subtitulo} onChange={campo("subtitulo")} />
      <CampoTexto rotulo="Texto do botão" dica="O botão abre o WhatsApp. Deixe vazio para esconder." valor={topo.botaoTexto} onChange={campo("botaoTexto")} />
      <CampoArea rotulo="Mensagem que já vem escrita no WhatsApp" linhas={2} valor={topo.mensagemWhatsapp} onChange={campo("mensagemWhatsapp")} />
      <CampoImagem rotulo="Foto do topo (opcional)" valor={topo.imagem} onChange={campo("imagem")} />
    </>
  );
}

const TIPOS: { tipo: TipoSecao; descricao: string }[] = [
  { tipo: "texto", descricao: "Título, texto e uma foto (ex.: Sobre mim)" },
  { tipo: "cards", descricao: "Cards com ícone, texto e lista (ex.: Serviços)" },
  { tipo: "eventos", descricao: "Cards de palestra ou treinamento que levam à inscrição" },
  { tipo: "galeria", descricao: "Grade de fotos que ampliam ao clicar" },
  { tipo: "etapas", descricao: "Passos numerados (ex.: Como funciona)" },
  { tipo: "cta", descricao: "Faixa com título, texto e botão para WhatsApp ou link" },
  { tipo: "contato", descricao: "Chamada com botões de WhatsApp e e-mail" },
];

const NOME_FORMATO = { palestra: "Palestra", treinamento: "Treinamento" } as const;
const CONTAGEM: Partial<Record<TipoSecao, [string, string]>> = {
  cards: ["card", "cards"],
  eventos: ["evento", "eventos"],
  etapas: ["etapa", "etapas"],
  galeria: ["foto", "fotos"],
};

function acoesDeAdicionar(tipo: TipoSecao): { rotulo: string; criar: () => Item }[] {
  switch (tipo) {
    case "eventos":
      return (["palestra", "treinamento"] as const).map((formato) => ({
        rotulo: NOME_FORMATO[formato],
        criar: () => novoItem({ formato, titulo: `Nova ${NOME_FORMATO[formato].toLowerCase()}` }),
      }));
    case "cards":
      return [{ rotulo: "Card", criar: () => novoItem({ icone: "sparkles", titulo: "Novo card" }) }];
    case "etapas":
      return [{ rotulo: "Etapa", criar: () => novoItem({ titulo: "Nova etapa" }) }];
    default:
      return [];
  }
}

const ID_TOPO = "__topo";

function AbaSecoes({ site, editar }: { site: Site; editar: Editar }) {
  const [aberta, setAberta] = useState<string | null>(null);
  const [destaque, setDestaque] = useState<string | null>(null);
  const [tipoNovo, setTipoNovo] = useState<TipoSecao>("eventos");

  function adicionarItem(i: number, item: Item) {
    editar((s) => {
      const secao = s.secoes[i];
      if ("itens" in secao) secao.itens.push(item);
    });
    setAberta(site.secoes[i].id);
    setDestaque(item.id);
  }

  function adicionarBloco(i: number, tipo: TipoBloco) {
    const bloco = novoBloco(tipo);
    editar((s) => void s.secoes[i].blocos.push(bloco));
    setAberta(site.secoes[i].id);
    setDestaque(bloco.id);
  }

  function adicionarBlocoTopo(tipo: TipoBloco) {
    const bloco = novoBloco(tipo);
    editar((s) => void s.topo.blocos.push(bloco));
    setAberta(ID_TOPO);
    setDestaque(bloco.id);
  }

  function adicionar() {
    const nova = novaSecao(tipoNovo);
    editar((s) => void s.secoes.push(nova));
    setAberta(nova.id);
  }

  return (
    <>
      <h2>Seções da página</h2>
      <p className="adm-ajuda">Clique numa seção para editar. Use as setas para mudar a ordem.</p>
      <ol className="adm-secoes">
        <li className={`adm-secao adm-secao--fixa ${aberta === ID_TOPO ? "aberta" : ""}`}>
          <div className="adm-secao__cabeca">
            <button type="button" className="adm-secao__titulo" onClick={() => setAberta(aberta === ID_TOPO ? null : ID_TOPO)}>
              <span className="adm-tag">Topo</span>
              {site.topo.titulo || "(sem título)"}
            </button>
            <span className="adm-secao__fixa" title="O topo fica sempre no início da página">fixo no início</span>
          </div>
          <div className="adm-secao__resumo">
            {TIPOS_BLOCO.map((t) => (
              <button key={t} type="button" className="adm-btn adm-btn--mini adm-btn--bloco" onClick={() => adicionarBlocoTopo(t)}>
                + {NOMES_BLOCO[t]}
              </button>
            ))}
          </div>
          {aberta === ID_TOPO && (
            <div className="adm-secao__corpo">
              <CamposTopo site={site} editar={editar} />
              <EditorBlocos
                blocos={site.topo.blocos}
                editarBlocos={(fn) => editar((s) => fn(s.topo.blocos))}
                destaque={destaque}
                aoAdicionar={adicionarBlocoTopo}
                dicaPosicao="Acima: logo abaixo do título principal. Abaixo: depois dos botões."
              />
            </div>
          )}
        </li>
        {site.secoes.map((secao, i) => (
          <li key={secao.id} className={`adm-secao ${aberta === secao.id ? "aberta" : ""} ${secao.visivel ? "" : "oculta"}`}>
            <div className="adm-secao__cabeca">
              <button type="button" className="adm-secao__titulo" onClick={() => setAberta(aberta === secao.id ? null : secao.id)}>
                <span className="adm-tag">{nomeDoTipo(secao.tipo)}</span>
                {secao.titulo || "(sem título)"}
                {!secao.visivel && <em> · oculta</em>}
              </button>
              <div className="adm-secao__botoes">
                <button type="button" title="Subir" disabled={i === 0} onClick={() => editar((s) => mover(s.secoes, i, i - 1))}>↑</button>
                <button type="button" title="Descer" disabled={i === site.secoes.length - 1} onClick={() => editar((s) => mover(s.secoes, i, i + 1))}>↓</button>
                <button
                  type="button"
                  title="Duplicar"
                  onClick={() =>
                    editar((s) => {
                      const copia = structuredClone(s.secoes[i]);
                      copia.id = novoId();
                      copia.titulo = `${copia.titulo} (cópia)`;
                      if ("itens" in copia) copia.itens.forEach((it) => (it.id = novoId("i")));
                      copia.blocos.forEach((b) => (b.id = novoId("b")));
                      s.secoes.splice(i + 1, 0, copia);
                    })
                  }
                >
                  ⧉
                </button>
                <button
                  type="button"
                  title="Excluir"
                  className="perigo"
                  onClick={() => confirm(`Excluir a seção "${secao.titulo}"?`) && editar((s) => void s.secoes.splice(i, 1))}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="adm-secao__resumo">
              {"itens" in secao && (
                <>
                <span>
                  {secao.itens.length} {CONTAGEM[secao.tipo]?.[secao.itens.length === 1 ? 0 : 1] ?? "itens"}
                </span>
                {acoesDeAdicionar(secao.tipo).map((a) => (
                  <button key={a.rotulo} type="button" className="adm-btn adm-btn--mini" onClick={() => adicionarItem(i, a.criar())}>
                    + {a.rotulo}
                  </button>
                ))}
                {secao.tipo === "galeria" && (
                  <button type="button" className="adm-btn adm-btn--mini" onClick={() => setAberta(secao.id)}>
                    + Fotos
                  </button>
                )}
                <span className="adm-secao__divisor" aria-hidden="true" />
                </>
              )}
              {TIPOS_BLOCO.map((t) => (
                <button key={t} type="button" className="adm-btn adm-btn--mini adm-btn--bloco" onClick={() => adicionarBloco(i, t)}>
                  + {NOMES_BLOCO[t]}
                </button>
              ))}
            </div>
            {aberta === secao.id && (
              <EditorSecao
                secao={secao}
                editarSecao={(fn) => editar((s) => fn(s.secoes[i]))}
                destaque={destaque}
                aoAdicionar={(item) => adicionarItem(i, item)}
                aoDestacar={setDestaque}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="adm-nova-secao">
        <h3>Adicionar seção</h3>
        <select value={tipoNovo} onChange={(e) => setTipoNovo(e.target.value as TipoSecao)}>
          {TIPOS.map((t) => (
            <option key={t.tipo} value={t.tipo}>
              {nomeDoTipo(t.tipo)} — {t.descricao}
            </option>
          ))}
        </select>
        <button type="button" className="adm-btn adm-btn--primario" onClick={adicionar}>
          + Adicionar
        </button>
      </div>
    </>
  );
}

function EditorSecao({
  secao,
  editarSecao,
  destaque,
  aoAdicionar,
  aoDestacar,
}: {
  secao: Secao;
  editarSecao: (fn: (s: Secao) => void) => void;
  destaque: string | null;
  aoAdicionar: (item: Item) => void;
  aoDestacar: (id: string) => void;
}) {
  const texto = (k: string) => (v: string) => editarSecao((s) => void ((s as unknown as Record<string, string>)[k] = v));
  const valor = (k: string) => (secao as unknown as Record<string, string>)[k] ?? "";

  return (
    <div className="adm-secao__corpo">
      <CampoTexto rotulo="Título" valor={secao.titulo} onChange={(v) => editarSecao((s) => void (s.titulo = v))} />
      <div className="adm-linha">
        <Alternar rotulo="Visível no site" valor={secao.visivel} onChange={(v) => editarSecao((s) => void (s.visivel = v))} />
        <Alternar rotulo="Mostrar no menu" valor={secao.noMenu} onChange={(v) => editarSecao((s) => void (s.noMenu = v))} />
      </div>
      <Campo rotulo="Fundo">
        <select value={secao.fundo} onChange={(e) => editarSecao((s) => void (s.fundo = e.target.value as Secao["fundo"]))}>
          <option value="claro">Claro</option>
          <option value="suave">Alternativo</option>
          <option value="destaque">Destaque (cor principal)</option>
        </select>
      </Campo>

      <EditorBlocos
        blocos={secao.blocos}
        editarBlocos={(fn) => editarSecao((s) => fn(s.blocos))}
        destaque={destaque}
        aoAdicionar={(tipo) => {
          const bloco = novoBloco(tipo);
          editarSecao((s) => void s.blocos.push(bloco));
          aoDestacar(bloco.id);
        }}
      />

      {secao.tipo === "texto" && (
        <>
          <CampoArea rotulo="Texto" dica="Deixe uma linha em branco para começar um novo parágrafo." linhas={7} valor={secao.texto} onChange={texto("texto")} />
          <CampoImagem rotulo="Imagem" valor={secao.imagem} onChange={texto("imagem")} />
          <Campo rotulo="Posição da imagem">
            <select value={secao.imagemLado} onChange={(e) => texto("imagemLado")(e.target.value)}>
              <option value="esquerda">À esquerda do texto</option>
              <option value="direita">À direita do texto</option>
            </select>
          </Campo>
        </>
      )}

      {(secao.tipo === "cards" || secao.tipo === "eventos" || secao.tipo === "etapas" || secao.tipo === "galeria") && (
        <CampoArea rotulo="Texto de introdução (opcional)" linhas={2} valor={secao.introducao} onChange={texto("introducao")} />
      )}

      {secao.tipo === "eventos" && (
        <CampoTexto rotulo="Texto do link de inscrição (vale para todos os cards)" placeholder="Inscreva-se" valor={secao.botaoTexto} onChange={texto("botaoTexto")} />
      )}

      {secao.tipo === "cta" && (
        <>
          <CampoArea rotulo="Texto" linhas={3} valor={secao.texto} onChange={texto("texto")} />
          <h3>Botão principal</h3>
          <CamposDestino
            texto={secao.botaoTexto}
            destino={secao.destino}
            link={secao.link}
            mensagem={secao.mensagemWhatsapp}
            onChange={(k, v) =>
              texto({ texto: "botaoTexto", destino: "destino", link: "link", mensagem: "mensagemWhatsapp" }[k])(v)
            }
          />
          <h3>Botão secundário (opcional)</h3>
          <div className="adm-linha">
            <CampoTexto rotulo="Texto" placeholder="Ver serviços" valor={secao.botao2Texto} onChange={texto("botao2Texto")} />
            <CampoTexto rotulo="Link" placeholder="https://... ou #servicos" valor={secao.botao2Link} onChange={texto("botao2Link")} />
          </div>
        </>
      )}

      {secao.tipo === "contato" && (
        <>
          <CampoArea rotulo="Texto" linhas={2} valor={valor("texto")} onChange={texto("texto")} />
          <CampoTexto rotulo="Texto do botão do WhatsApp" valor={secao.botaoTexto} onChange={texto("botaoTexto")} />
          <CampoArea rotulo="Mensagem que já vem escrita no WhatsApp" linhas={2} valor={secao.mensagemWhatsapp} onChange={texto("mensagemWhatsapp")} />
          <p className="adm-ajuda">O número do WhatsApp e o e-mail ficam na aba Informações.</p>
        </>
      )}

      {"itens" in secao && (
        <EditorItens
          tipo={secao.tipo}
          itens={secao.itens}
          editarItens={(fn) => editarSecao((s) => "itens" in s && fn(s.itens))}
          destaque={destaque}
          aoAdicionar={aoAdicionar}
        />
      )}
    </div>
  );
}

const NOME_ITEM: Partial<Record<TipoSecao, string>> = { cards: "Card", etapas: "Etapa", galeria: "Foto" };

function useDestaque(ativo: boolean) {
  const ref = useRef<HTMLFieldSetElement>(null);
  useEffect(() => {
    if (!ativo || !ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    ref.current.querySelector<HTMLInputElement>("input:not([type=file]), select")?.focus({ preventScroll: true });
  }, [ativo]);
  return ref;
}

function ItemEditavel({ destacado, children }: { destacado: boolean; children: React.ReactNode }) {
  const ref = useDestaque(destacado);
  return (
    <fieldset ref={ref} className={`adm-item ${destacado ? "adm-item--novo" : ""}`}>
      {children}
    </fieldset>
  );
}

function EditorItens({
  tipo,
  itens,
  editarItens,
  destaque,
  aoAdicionar,
}: {
  tipo: TipoSecao;
  itens: Item[];
  editarItens: (fn: (itens: Item[]) => void) => void;
  destaque: string | null;
  aoAdicionar: (item: Item) => void;
}) {
  const eventos = tipo === "eventos";
  const galeria = tipo === "galeria";
  const nome = NOME_ITEM[tipo] ?? "Item";
  const nomeDoItem = (item: Item) => (eventos ? NOME_FORMATO[item.formato] : nome);
  const titulo = eventos ? "Palestras e treinamentos" : galeria ? "Fotos" : `${nome}s`;

  return (
    <div className="adm-itens">
      <h3>{titulo}</h3>
      {itens.map((item, i) => {
        const campo = (k: keyof Item) => (v: string) => editarItens((l) => void ((l[i][k] as string) = v));
        return (
          <ItemEditavel key={item.id} destacado={item.id === destaque}>
            <legend>
              {nomeDoItem(item)} {i + 1}
              <span className="adm-secao__botoes">
                <button type="button" title="Subir" disabled={i === 0} onClick={() => editarItens((l) => mover(l, i, i - 1))}>↑</button>
                <button type="button" title="Descer" disabled={i === itens.length - 1} onClick={() => editarItens((l) => mover(l, i, i + 1))}>↓</button>
                <button
                  type="button"
                  title="Excluir"
                  className="perigo"
                  onClick={() => confirm(`Excluir "${item.titulo || `${nomeDoItem(item)} ${i + 1}`}"?`) && editarItens((l) => void l.splice(i, 1))}
                >
                  ✕
                </button>
              </span>
            </legend>

            {galeria && (
              <>
                <CampoImagem rotulo="Foto" valor={item.imagem} onChange={campo("imagem")} />
                <CampoTexto rotulo="Legenda (opcional)" valor={item.titulo} onChange={campo("titulo")} />
              </>
            )}

            {eventos && (
              <>
                <Campo rotulo="Tipo">
                  <select value={item.formato} onChange={(e) => editarItens((l) => void (l[i].formato = e.target.value as Item["formato"]))}>
                    <option value="palestra">Palestra</option>
                    <option value="treinamento">Treinamento</option>
                  </select>
                </Campo>
                <CampoImagem rotulo="Imagem" valor={item.imagem} onChange={campo("imagem")} />
              </>
            )}
            {tipo === "cards" && (
              <SeletorIcone valor={item.icone} onChange={campo("icone")} />
            )}
            {!galeria && <CampoTexto rotulo="Título" valor={item.titulo} onChange={campo("titulo")} />}
            {eventos && (
              <>
                <div className="adm-linha">
                  <CampoTexto rotulo="Data e horário" placeholder="Sábado, 05/12 · 9h" valor={item.data} onChange={campo("data")} />
                  <CampoTexto rotulo="Local" placeholder="Online / Cidade" valor={item.local} onChange={campo("local")} />
                </div>
                <div className="adm-linha">
                  <CampoTexto rotulo="Duração (opcional)" placeholder="4 horas" valor={item.duracao} onChange={campo("duracao")} />
                  <CampoTexto rotulo="Investimento (opcional)" placeholder="R$ 197,00 ou Gratuito" valor={item.preco} onChange={campo("preco")} />
                </div>
              </>
            )}
            {!galeria && <CampoArea rotulo={eventos ? "Descrição" : "Texto"} linhas={3} valor={item.texto} onChange={campo("texto")} />}
            {(eventos || tipo === "cards") && (
              <CampoArea
                rotulo={eventos ? "O que você vai aprender (opcional)" : "Lista de tópicos"}
                dica="Um tópico por linha."
                linhas={3}
                valor={item.lista.join("\n")}
                onChange={(v) => editarItens((l) => void (l[i].lista = v.split("\n")))}
              />
            )}
            {eventos && (
              <CampoTexto
                rotulo="Link da página de inscrição"
                dica="Ao clicar no card, o visitante vai para este endereço (Sympla, formulário, etc.). Sem link, aparece “Inscrições em breve”."
                placeholder="https://..."
                tipo="url"
                valor={item.link}
                onChange={campo("link")}
              />
            )}
            {tipo === "cards" && <CampoImagem rotulo="Imagem do card (opcional)" valor={item.imagem} onChange={campo("imagem")} />}
          </ItemEditavel>
        );
      })}

      {galeria ? (
        <EnviarFotos aoEnviar={(urls) => editarItens((l) => void l.push(...urls.map((imagem) => novoItem({ imagem }))))} />
      ) : (
        <div className="adm-linha">
          {acoesDeAdicionar(tipo).map((a) => (
            <button key={a.rotulo} type="button" className="adm-btn" onClick={() => aoAdicionar(a.criar())}>
              + Adicionar {a.rotulo.toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const TIPOS_BLOCO: TipoBloco[] = ["subtitulo", "texto", "imagem", "botao"];

function EditorBlocos({
  blocos,
  editarBlocos,
  destaque,
  aoAdicionar,
  dicaPosicao,
}: {
  blocos: Bloco[];
  editarBlocos: (fn: (blocos: Bloco[]) => void) => void;
  destaque: string | null;
  aoAdicionar: (tipo: TipoBloco) => void;
  dicaPosicao?: string;
}) {
  return (
    <div className="adm-itens adm-blocos">
      <h3>Subtítulos, textos e imagens extras</h3>
      {blocos.length === 0 && <p className="adm-ajuda">Acrescente um subtítulo, um texto ou uma imagem a esta seção.</p>}
      {blocos.map((b, i) => {
        const valor = (k: string) => (v: string) => editarBlocos((l) => void ((l[i] as unknown as Record<string, string>)[k] = v));
        return (
          <ItemEditavel key={b.id} destacado={b.id === destaque}>
            <legend>
              {NOMES_BLOCO[b.tipo]}
              <span className="adm-secao__botoes">
                <button type="button" title="Subir" disabled={i === 0} onClick={() => editarBlocos((l) => mover(l, i, i - 1))}>↑</button>
                <button type="button" title="Descer" disabled={i === blocos.length - 1} onClick={() => editarBlocos((l) => mover(l, i, i + 1))}>↓</button>
                <button
                  type="button"
                  title="Excluir"
                  className="perigo"
                  onClick={() => confirm(`Excluir este bloco (${NOMES_BLOCO[b.tipo].toLowerCase()})?`) && editarBlocos((l) => void l.splice(i, 1))}
                >
                  ✕
                </button>
              </span>
            </legend>
            {b.tipo === "subtitulo" && <CampoTexto rotulo="Subtítulo" valor={b.texto} onChange={valor("texto")} />}
            {b.tipo === "texto" && (
              <CampoArea rotulo="Texto" dica="Deixe uma linha em branco para começar um novo parágrafo." linhas={4} valor={b.texto} onChange={valor("texto")} />
            )}
            {b.tipo === "imagem" && (
              <>
                <CampoImagem rotulo="Imagem" valor={b.imagem} onChange={valor("imagem")} />
                <div className="adm-linha">
                  <CampoTexto rotulo="Legenda (opcional)" valor={b.legenda} onChange={valor("legenda")} />
                  <Campo rotulo="Tamanho">
                    <select value={b.largura} onChange={(e) => valor("largura")(e.target.value)}>
                      <option value="normal">Normal</option>
                      <option value="larga">Largura total</option>
                    </select>
                  </Campo>
                </div>
              </>
            )}
            {b.tipo === "botao" && (
              <>
                <CamposDestino
                  texto={b.texto}
                  destino={b.destino}
                  link={b.link}
                  mensagem={b.mensagemWhatsapp}
                  onChange={(k, v) => valor({ texto: "texto", destino: "destino", link: "link", mensagem: "mensagemWhatsapp" }[k])(v)}
                />
                <Campo rotulo="Estilo">
                  <select value={b.estilo} onChange={(e) => valor("estilo")(e.target.value)}>
                    <option value="cheio">Preenchido (cor principal)</option>
                    <option value="contorno">Só contorno</option>
                  </select>
                </Campo>
              </>
            )}
            <Campo rotulo="Posição" dica={dicaPosicao}>
              <select value={b.posicao} onChange={(e) => valor("posicao")(e.target.value)}>
                <option value="antes">{dicaPosicao ? "Acima" : "Acima do conteúdo da seção (logo abaixo do título)"}</option>
                <option value="depois">{dicaPosicao ? "Abaixo" : "Abaixo do conteúdo da seção"}</option>
              </select>
            </Campo>
          </ItemEditavel>
        );
      })}
      <div className="adm-linha">
        {TIPOS_BLOCO.map((t) => (
          <button key={t} type="button" className="adm-btn" onClick={() => aoAdicionar(t)}>
            + {NOMES_BLOCO[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

function CamposDestino({
  texto,
  destino,
  link,
  mensagem,
  onChange,
}: {
  texto: string;
  destino: "whatsapp" | "link";
  link: string;
  mensagem: string;
  onChange: (campo: "texto" | "destino" | "link" | "mensagem", valor: string) => void;
}) {
  return (
    <>
      <div className="adm-linha">
        <CampoTexto rotulo="Texto do botão" valor={texto} onChange={(v) => onChange("texto", v)} />
        <Campo rotulo="Leva para">
          <select value={destino} onChange={(e) => onChange("destino", e.target.value)}>
            <option value="whatsapp">WhatsApp</option>
            <option value="link">Um link</option>
          </select>
        </Campo>
      </div>
      {destino === "whatsapp" ? (
        <CampoArea
          rotulo="Mensagem que já vem escrita no WhatsApp"
          dica="O número fica na aba Informações."
          linhas={2}
          valor={mensagem}
          onChange={(v) => onChange("mensagem", v)}
        />
      ) : (
        <CampoTexto
          rotulo="Link"
          dica="Endereço completo (https://...) ou uma seção da página (#servicos, #contato...)."
          placeholder="https://..."
          valor={link}
          onChange={(v) => onChange("link", v)}
        />
      )}
    </>
  );
}

function EnviarFotos({ aoEnviar }: { aoEnviar: (urls: string[]) => void }) {
  const [progresso, setProgresso] = useState<string | null>(null);
  const [erros, setErros] = useState<string[]>([]);

  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = [...(e.target.files ?? [])];
    e.target.value = "";
    if (arquivos.length === 0) return;
    const urls: string[] = [];
    const falhas: string[] = [];
    for (const [n, arquivo] of arquivos.entries()) {
      setProgresso(`Enviando ${n + 1} de ${arquivos.length}...`);
      const r = await enviarImagem(arquivo);
      if ("url" in r) urls.push(r.url);
      else falhas.push(`${arquivo.name}: ${r.erro}`);
    }
    setProgresso(null);
    setErros(falhas);
    if (urls.length) aoEnviar(urls);
  }

  return (
    <div>
      <label className={`adm-btn adm-btn--primario ${progresso ? "adm-btn--off" : ""}`}>
        {progresso ?? "+ Enviar fotos"}
        <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" hidden disabled={Boolean(progresso)} onChange={enviar} />
      </label>
      <p className="adm-ajuda">Dá para selecionar várias fotos de uma vez (PNG, JPG, WEBP ou GIF, até 5 MB cada).</p>
      {erros.map((e) => (
        <p key={e} className="adm-erro">
          {e}
        </p>
      ))}
    </div>
  );
}
