import { render, screen, within } from "@testing-library/react";
import { SiteView } from "@/components/site/SiteView";
import { conteudoPadrao, novaSecao, novoBloco } from "@/lib/conteudo-padrao";
import { siteSchema, type Site } from "@/lib/schema";

const clonar = (): Site => structuredClone(conteudoPadrao);

describe("CTA", () => {
  it("o site traz uma faixa de CTA com botão para o WhatsApp e botão secundário", () => {
    render(<SiteView site={conteudoPadrao} />);
    const cta = document.getElementById("cta-empresas")!;
    expect(within(cta).getByRole("heading", { level: 2 })).toHaveTextContent("Leve esta transformação para a sua empresa");
    const principal = within(cta).getByRole("link", { name: "Solicitar proposta" });
    expect(principal.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/5511999999999\?text=/);
    expect(principal).toHaveAttribute("target", "_blank");
    const secundario = within(cta).getByRole("link", { name: "Ver serviços" });
    expect(secundario).toHaveAttribute("href", "#servicos");
    expect(secundario).not.toHaveAttribute("target"); // link interno não abre nova aba
  });

  it("botão principal pode levar a um link", () => {
    const site = clonar();
    const cta = novaSecao("cta");
    if (cta.tipo !== "cta") throw new Error();
    Object.assign(cta, { id: "cta-teste", destino: "link", link: "https://agenda.exemplo.com", botaoTexto: "Ver agenda" });
    site.secoes.push(cta);
    render(<SiteView site={site} />);
    expect(screen.getByRole("link", { name: "Ver agenda" })).toHaveAttribute("href", "https://agenda.exemplo.com");
  });

  it("bloco Botão funciona dentro de uma seção existente e no topo", () => {
    const site = clonar();
    site.secoes.find((s) => s.id === "sobre")!.blocos.push({ ...novoBloco("botao"), texto: "Quero começar" });
    site.topo.blocos.push({ ...novoBloco("botao"), texto: "Baixar e-book", destino: "link", link: "https://exemplo.com/ebook", estilo: "contorno" });
    render(<SiteView site={site} />);
    const sobre = document.getElementById("sobre")!;
    expect(within(sobre).getByRole("link", { name: "Quero começar" }).getAttribute("href")).toMatch(/^https:\/\/wa\.me\//);
    const ebook = within(document.getElementById("inicio")!).getByRole("link", { name: "Baixar e-book" });
    expect(ebook).toHaveAttribute("href", "https://exemplo.com/ebook");
    expect(ebook).toHaveClass("btn--ghost");
  });

  it("botão sem destino não aparece", () => {
    const site = clonar();
    site.secoes[0].blocos.push({ ...novoBloco("botao"), texto: "Sem link", destino: "link", link: "" });
    render(<SiteView site={site} />);
    expect(screen.queryByRole("link", { name: "Sem link" })).toBeNull();
  });

  it("aceita link para seção (#id) e recusa javascript:", () => {
    const site = clonar();
    const b = { ...novoBloco("botao"), destino: "link" as const, link: "#contato" };
    site.secoes[0].blocos.push(b);
    expect(siteSchema.safeParse(site).success).toBe(true);
    b.link = "javascript:alert(1)";
    expect(siteSchema.safeParse(site).success).toBe(false);
  });
});
