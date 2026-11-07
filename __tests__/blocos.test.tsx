import { render, within } from "@testing-library/react";
import { SiteView } from "@/components/site/SiteView";
import { conteudoPadrao, novoBloco } from "@/lib/conteudo-padrao";
import { siteSchema, type Site } from "@/lib/schema";

const clonar = (): Site => structuredClone(conteudoPadrao);
const secao = (site: Site, id: string) => site.secoes.find((s) => s.id === id)!;

describe("blocos extras dentro de seções existentes", () => {
  it("subtítulo acima e texto/imagem abaixo do conteúdo da seção", () => {
    const site = clonar();
    const sub = { ...novoBloco("subtitulo"), texto: "Agenda 2027" };
    const txt = { ...novoBloco("texto"), texto: "Turmas também in company." };
    const img = { ...novoBloco("imagem"), imagem: "/uploads/palco.jpg", legenda: "Palestra em SP" };
    secao(site, "treinamentos-e-palestras").blocos.push(sub, txt, img);
    render(<SiteView site={site} />);

    const el = document.getElementById("treinamentos-e-palestras")!;
    const subtitulo = within(el).getByRole("heading", { name: "Agenda 2027", level: 3 });
    const primeiroCard = el.querySelector(".evento")!;
    const texto = within(el).getByText("Turmas também in company.");
    // ordem no documento: título → subtítulo → cards → texto/imagem
    expect(subtitulo.compareDocumentPosition(primeiroCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(primeiroCard.compareDocumentPosition(texto) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // passa pelo otimizador de imagens do Next
    expect(within(el).getByRole("img", { name: "Palestra em SP" }).getAttribute("src")).toContain("url=%2Fuploads%2Fpalco.jpg");
    expect(within(el).getByText("Palestra em SP", { selector: "figcaption" })).toBeInTheDocument();
  });

  it("funciona também em seções de texto, como Sobre mim", () => {
    const site = clonar();
    secao(site, "sobre").blocos.push({ ...novoBloco("subtitulo"), texto: "Formação" }, { ...novoBloco("texto"), texto: "Coach certificada." });
    render(<SiteView site={site} />);
    const el = document.getElementById("sobre")!;
    expect(within(el).getByRole("heading", { name: "Formação" })).toBeInTheDocument();
    expect(within(el).getByText("Coach certificada.")).toBeInTheDocument();
  });

  it("imagem sem arquivo e subtítulo vazio não aparecem", () => {
    const site = clonar();
    secao(site, "sobre").blocos.push({ ...novoBloco("imagem") }, { ...novoBloco("subtitulo"), texto: "" });
    render(<SiteView site={site} />);
    const el = document.getElementById("sobre")!;
    expect(el.querySelector("figure")).toBeNull();
    expect(el.querySelector(".bloco-subtitulo")).toBeNull();
  });

  it("conteúdo salvo antes dos blocos continua válido", () => {
    const antigo = JSON.parse(JSON.stringify(conteudoPadrao));
    antigo.secoes.forEach((s: { blocos?: unknown }) => delete s.blocos);
    const r = siteSchema.safeParse(antigo);
    expect(r.success).toBe(true);
    expect(r.success && r.data.secoes.every((s) => Array.isArray(s.blocos) && s.blocos.length === 0)).toBe(true);
  });

  it("o topo também aceita blocos: acima fica logo abaixo do título, abaixo fica depois dos botões", () => {
    const site = clonar();
    site.topo.blocos.push({ ...novoBloco("subtitulo"), texto: "Mais de 10 anos de experiência" }, { ...novoBloco("texto"), texto: "Atendimento online e presencial." });
    render(<SiteView site={site} />);
    const topo = document.getElementById("inicio")!;
    const h1 = within(topo).getByRole("heading", { level: 1 });
    const sub = within(topo).getByRole("heading", { name: "Mais de 10 anos de experiência" });
    const botao = within(topo).getByRole("link", { name: site.topo.botaoTexto });
    const texto = within(topo).getByText("Atendimento online e presencial.");
    expect(h1.compareDocumentPosition(sub) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(botao.compareDocumentPosition(texto) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("topo salvo antes dos blocos continua válido", () => {
    const antigo = JSON.parse(JSON.stringify(conteudoPadrao));
    delete antigo.topo.blocos;
    const r = siteSchema.safeParse(antigo);
    expect(r.success && r.data.topo.blocos).toEqual([]);
  });

  it("recusa imagem perigosa em bloco", () => {
    const site = clonar();
    secao(site, "sobre").blocos.push({ ...novoBloco("imagem"), imagem: "javascript:alert(1)" });
    expect(siteSchema.safeParse(site).success).toBe(false);
  });
});
