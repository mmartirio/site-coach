import { render } from "@testing-library/react";
import { SiteView } from "@/components/site/SiteView";
import { conteudoPadrao } from "@/lib/conteudo-padrao";
import { Icone, ICONES, iconePorNome } from "@/lib/icones";
import type { Site } from "@/lib/schema";

describe("ícones Lucide", () => {
  it("todos os ícones do catálogo existem na biblioteca", () => {
    for (const [chave, { Icone: Comp }] of Object.entries(ICONES)) {
      expect([chave, typeof Comp === "function" || typeof Comp === "object"]).toEqual([chave, true]);
    }
  });

  it("renderiza o svg pelo nome salvo", () => {
    const { container } = render(<Icone nome="rocket" />);
    expect(container.querySelector("svg.lucide")).not.toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("emojis salvos antes viram o ícone equivalente", () => {
    expect(iconePorNome("🧠")).toBe(ICONES.brain.Icone);
    expect(iconePorNome("🎯")).toBe(ICONES.target.Icone);
  });

  it("valor desconhecido aparece como texto e vazio não renderiza nada", () => {
    expect(render(<Icone nome="🦄" />).container).toHaveTextContent("🦄");
    expect(render(<Icone nome="" />).container).toBeEmptyDOMElement();
  });

  it("cards de palestra usam ícones Lucide para data, local e duração", () => {
    const site: Site = structuredClone(conteudoPadrao);
    const s = site.secoes.find((x) => x.id === "treinamentos-e-palestras");
    if (!s || s.tipo !== "eventos") throw new Error();
    s.itens[0].imagem = ""; // sem imagem: mostra o ícone no lugar
    render(<SiteView site={site} />);
    const el = document.getElementById("treinamentos-e-palestras")!;
    expect(el.querySelector(".evento__meta svg.lucide-calendar")).not.toBeNull();
    expect(el.querySelector(".evento__meta svg.lucide-map-pin")).not.toBeNull();
    expect(el.querySelector(".evento__meta svg.lucide-clock")).not.toBeNull();
    expect(el.querySelector(".evento__imagem svg.lucide-presentation")).not.toBeNull();
    expect(el.textContent).not.toMatch(/[📅📍⏱🎤]/u);
  });
});
