import { render, screen, within } from "@testing-library/react";
import { SiteView } from "@/components/site/SiteView";
import { conteudoPadrao } from "@/lib/conteudo-padrao";
import type { Site } from "@/lib/schema";
import { whatsappLink } from "@/lib/utils";

const clonar = (): Site => structuredClone(conteudoPadrao);

describe("SiteView", () => {
  it("exibe o título principal e os serviços", () => {
    render(<SiteView site={conteudoPadrao} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/clareza para decidir/i);
    const servicos = document.getElementById("servicos")!;
    expect(within(servicos).getByRole("heading", { name: "Coach Pessoal e Profissional" })).toBeInTheDocument();
    // ícones Lucide (svg), não emojis
    expect(servicos.querySelector(".card__icone svg.lucide-brain")).not.toBeNull();
    expect(servicos.querySelector(".card__icone svg.lucide-target")).not.toBeNull();
  });

  it("cria um link no menu para cada seção marcada", () => {
    render(<SiteView site={conteudoPadrao} />);
    const nav = screen.getByRole("navigation", { name: /navegação principal/i });
    for (const s of conteudoPadrao.secoes.filter((s) => s.noMenu)) {
      expect(within(nav).getAllByRole("link").some((a) => a.getAttribute("href") === `#${s.id}`)).toBe(true);
      expect(document.getElementById(s.id)).not.toBeNull();
    }
  });

  it("não exibe seções ocultas", () => {
    const site = clonar();
    site.secoes.find((s) => s.id === "servicos")!.visivel = false;
    render(<SiteView site={site} />);
    expect(document.getElementById("servicos")).toBeNull();
    expect(screen.queryByRole("link", { name: "Serviços" })).toBeNull();
  });

  it("oferece contato por WhatsApp e e-mail", () => {
    render(<SiteView site={conteudoPadrao} />);
    const whats = screen.getByRole("link", { name: /falar no whatsapp/i });
    expect(whats).toHaveAttribute("href", expect.stringContaining(`https://wa.me/${conteudoPadrao.info.whatsapp}`));
    expect(whats).toHaveAttribute("target", "_blank");
    const { email } = conteudoPadrao.info;
    expect(screen.getByRole("link", { name: email })).toHaveAttribute("href", `mailto:${email}`);
  });
});

describe("Seção de eventos (Treinamentos e Palestras)", () => {
  const secaoEventos = (site: Site) => {
    const s = site.secoes.find((x) => x.tipo === "eventos");
    if (!s || s.tipo !== "eventos") throw new Error("seção de eventos ausente");
    return s;
  };

  it("existe no conteúdo padrão, com imagem e descrição em cada card", () => {
    render(<SiteView site={conteudoPadrao} />);
    const secao = document.getElementById("treinamentos-e-palestras")!;
    expect(within(secao).getByRole("heading", { level: 2 })).toHaveTextContent("Treinamentos e Palestras");
    for (const ev of secaoEventos(conteudoPadrao).itens) {
      expect(within(secao).getByRole("heading", { name: ev.titulo })).toBeInTheDocument();
      expect(within(secao).getByText(ev.texto)).toBeInTheDocument();
    }
    expect(secao.querySelectorAll("img")).toHaveLength(2);
  });

  it("o card inteiro leva à página de inscrição, em nova aba", () => {
    const site = clonar();
    const ev = secaoEventos(site).itens[0];
    ev.link = "https://exemplo.com/inscricao";
    render(<SiteView site={site} />);
    const link = screen.getByRole("link", { name: new RegExp(ev.titulo) });
    expect(link).toHaveAttribute("href", "https://exemplo.com/inscricao");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    // a imagem e a descrição ficam dentro do link
    expect(link.querySelector("img")).not.toBeNull();
    expect(within(link).getByText(ev.texto)).toBeInTheDocument();
  });

  it("sem link, o card não é clicável e avisa que as inscrições abrem em breve", () => {
    render(<SiteView site={conteudoPadrao} />);
    const secao = document.getElementById("treinamentos-e-palestras")!;
    expect(within(secao).queryAllByRole("link")).toHaveLength(0);
    expect(within(secao).getAllByText("Inscrições em breve")).toHaveLength(2);
  });
});

describe("whatsappLink", () => {
  it("remove caracteres não numéricos e codifica a mensagem", () => {
    expect(whatsappLink("+55 (11) 99999-9999", "Olá, tudo bem?")).toBe(
      "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tudo%20bem%3F",
    );
  });
});
