import { conteudoPadrao } from "@/lib/conteudo-padrao";
import { siteSchema, temaSchema } from "@/lib/schema";
import { aplicarTema, TEMAS, temaAtivo } from "@/lib/temas";

function contraste(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

describe("temas de cores", () => {
  it.each(TEMAS.map((t) => [t.nome, t] as const))("%s é válido e legível", (_, t) => {
    const c = t.cores;
    expect(temaSchema.safeParse({ ...c, fonteTitulos: "georgia", fonteTexto: "sistema" }).success).toBe(true);
    expect(contraste(c.corTextoBotao, c.corPrimaria)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(c.corTextoBotao, c.corPrimariaEscura)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(c.corPrimariaEscura, c.corFundo)).toBeGreaterThanOrEqual(4.5);
    for (const fundo of [c.corFundo, c.corFundoSuave, c.corCartao]) {
      expect(contraste(c.corTexto, fundo)).toBeGreaterThanOrEqual(7);
      expect(contraste(c.corTextoSuave, fundo)).toBeGreaterThanOrEqual(4.5);
      expect(contraste(c.corTitulos, fundo)).toBeGreaterThanOrEqual(4.5);
      expect(contraste(c.corPrimaria, fundo)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("há pelo menos 3 temas escuros e cada tema tem cor própria de card", () => {
    expect(TEMAS.filter((t) => t.escuro).length).toBeGreaterThanOrEqual(3);
    expect(new Set(TEMAS.map((t) => t.cores.corCartao)).size).toBe(TEMAS.length);
    for (const t of TEMAS.filter((t) => !t.escuro)) expect(t.cores.corCartao).not.toBe("#ffffff");
  });

  it("o tema original é o do conteúdo padrão", () => {
    expect(temaAtivo(conteudoPadrao.tema)?.id).toBe("ameixa");
  });

  it("aplicar um tema troca as cores e mantém as fontes", () => {
    const tema = { ...conteudoPadrao.tema, fonteTitulos: "playfair" as const, fonteTexto: "lato" as const };
    const noite = TEMAS.find((t) => t.id === "noite-oceano")!;
    const novo = aplicarTema(tema, noite);
    expect(novo.corCartao).toBe(noite.cores.corCartao);
    expect(novo.fonteTitulos).toBe("playfair");
    expect(temaAtivo(novo)?.id).toBe("noite-oceano");
  });

  it("cores alteradas à mão deixam de corresponder a um tema pronto", () => {
    expect(temaAtivo({ ...conteudoPadrao.tema, corCartao: "#123456" })).toBeNull();
  });

  it("tema salvo antes das cores novas mantém o visual antigo", () => {
    const antigo = JSON.parse(JSON.stringify(conteudoPadrao));
    delete antigo.tema.corTitulos;
    delete antigo.tema.corCartao;
    delete antigo.tema.corTextoBotao;
    const r = siteSchema.safeParse(antigo);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.tema.corTitulos).toBe(antigo.tema.corPrimariaEscura);
    expect(r.data.tema.corCartao).toBe("#ffffff");
    expect(r.data.tema.corTextoBotao).toBe("#ffffff");
  });
});
