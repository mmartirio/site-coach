import { fireEvent, render, screen, within } from "@testing-library/react";
import { SiteView } from "@/components/site/SiteView";
import { conteudoPadrao, novaSecao, novoItem } from "@/lib/conteudo-padrao";
import { siteSchema, type Secao, type Site } from "@/lib/schema";

const clonar = (): Site => structuredClone(conteudoPadrao);
const eventosDe = (site: Site) => {
  const s = site.secoes.find((x) => x.id === "treinamentos-e-palestras");
  if (!s || s.tipo !== "eventos") throw new Error("seção ausente");
  return s;
};

describe("cards de palestras e treinamentos", () => {
  it("mostra o selo do tipo em cada card", () => {
    render(<SiteView site={conteudoPadrao} />);
    const secao = document.getElementById("treinamentos-e-palestras")!;
    expect(within(secao).getByText("Treinamento")).toBeInTheDocument();
    expect(within(secao).getByText("Palestra")).toBeInTheDocument();
  });

  it("exibe duração, investimento e o que se vai aprender quando preenchidos", () => {
    const site = clonar();
    const ev = eventosDe(site).itens[0];
    Object.assign(ev, { duracao: "8 horas", preco: "R$ 197,00", lista: ["Tópico A", "", "Tópico B"] });
    render(<SiteView site={site} />);
    const secao = document.getElementById("treinamentos-e-palestras")!;
    expect(within(secao).getByText("8 horas", { exact: false }).querySelector("svg.lucide-clock")).not.toBeNull();
    expect(within(secao).getByText("R$ 197,00")).toBeInTheDocument();
    expect(within(secao).getByText("O que você vai aprender")).toBeInTheDocument();
    const lista = within(secao).getByText("Tópico A").closest("ul")!;
    expect(within(lista).getAllByRole("listitem")).toHaveLength(2);
  });

  it("um treinamento com link leva à inscrição", () => {
    const site = clonar();
    eventosDe(site).itens.push(novoItem({ formato: "treinamento", titulo: "Oratória", link: "https://exemplo.com/oratoria" }));
    render(<SiteView site={site} />);
    const link = screen.getByRole("link", { name: /Treinamento Oratória/ });
    expect(link).toHaveAttribute("href", "https://exemplo.com/oratoria");
  });

  it("não existe mais seção de cursos no conteúdo padrão", () => {
    expect(conteudoPadrao.secoes.some((s) => /curso/i.test(s.titulo) || s.id === "cursos")).toBe(false);
  });

  it("conteúdo salvo antes dos campos novos continua válido (vira palestra)", () => {
    const antigo = JSON.parse(JSON.stringify(conteudoPadrao));
    for (const it of antigo.secoes.find((s: Secao) => s.tipo === "eventos").itens) {
      delete it.formato;
      delete it.duracao;
      delete it.preco;
    }
    antigo.secoes.find((s: Secao) => s.tipo === "eventos").itens[1].formato = "curso";
    const r = siteSchema.safeParse(antigo);
    expect(r.success).toBe(true);
    const ev = r.success && r.data.secoes.find((s) => s.tipo === "eventos");
    if (!ev || ev.tipo !== "eventos") throw new Error();
    expect(ev.itens.map((i) => i.formato)).toEqual(["palestra", "palestra"]);
    expect(ev.itens[0].duracao).toBe("");
  });
});

describe("galeria", () => {
  const comGaleria = (n: number) => {
    const site = clonar();
    const g = novaSecao("galeria");
    if (g.tipo !== "galeria") throw new Error();
    g.id = "galeria";
    g.itens = Array.from({ length: n }, (_, i) => novoItem({ imagem: `/uploads/foto-${i + 1}.jpg`, titulo: i === 0 ? "Palestra em SP" : "" }));
    site.secoes.push(g);
    return site;
  };

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
    HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  });

  it("mostra uma miniatura por foto, com legenda", () => {
    render(<SiteView site={comGaleria(3)} />);
    const secao = document.getElementById("galeria")!;
    expect(within(secao).getAllByRole("button", { name: /ampliar foto/i })).toHaveLength(3);
    expect(within(secao).getByText("Palestra em SP")).toBeInTheDocument();
  });

  it("clicar amplia a foto e as setas navegam", () => {
    render(<SiteView site={comGaleria(3)} />);
    fireEvent.click(screen.getByRole("button", { name: "Ampliar foto: Palestra em SP" }));
    const tela = document.querySelector("dialog")!;
    expect(tela).toHaveAttribute("open");
    expect(within(tela).getByText(/1 de 3/)).toBeInTheDocument();
    fireEvent.click(within(tela).getByRole("button", { name: "Próxima foto" }));
    expect(within(tela).getByText(/2 de 3/)).toBeInTheDocument();
    fireEvent.click(within(tela).getByRole("button", { name: "Foto anterior" }));
    fireEvent.click(within(tela).getByRole("button", { name: "Foto anterior" }));
    expect(within(tela).getByText(/3 de 3/)).toBeInTheDocument();
    fireEvent.click(within(tela).getByRole("button", { name: "Fechar" }));
    expect(tela).not.toHaveAttribute("open");
  });

  it("galeria vazia mostra aviso em vez de quebrar", () => {
    render(<SiteView site={comGaleria(0)} />);
    expect(within(document.getElementById("galeria")!).getByText(/nenhuma foto/i)).toBeInTheDocument();
  });
});
