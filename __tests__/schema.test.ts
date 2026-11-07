import { conteudoPadrao, novaSecao } from "@/lib/conteudo-padrao";
import { siteSchema, type Site, type TipoSecao } from "@/lib/schema";

const clonar = (): Site => structuredClone(conteudoPadrao);

describe("siteSchema", () => {
  it("aceita o conteúdo padrão", () => {
    expect(siteSchema.safeParse(conteudoPadrao).success).toBe(true);
  });

  it.each<TipoSecao>(["texto", "cards", "eventos", "galeria", "etapas", "cta", "contato"])("aceita uma nova seção do tipo %s", (tipo) => {
    const site = clonar();
    site.secoes.push(novaSecao(tipo));
    expect(siteSchema.safeParse(site).success).toBe(true);
  });

  it("rejeita cor fora do formato #RRGGBB", () => {
    const site = clonar();
    site.tema.corPrimaria = "red; background: url(x)";
    expect(siteSchema.safeParse(site).success).toBe(false);
  });

  it("rejeita fonte desconhecida", () => {
    const site = clonar() as unknown as { tema: { fonteTitulos: string } };
    site.tema.fonteTitulos = "comic-sans";
    expect(siteSchema.safeParse(site).success).toBe(false);
  });

  it.each(["javascript:alert(1)", "data:text/html,oi", "/uploads/../../etc/passwd", "http://inseguro.com/a.png"])(
    "rejeita imagem perigosa: %s",
    (url) => {
      const site = clonar();
      site.topo.imagem = url;
      expect(siteSchema.safeParse(site).success).toBe(false);
    },
  );

  it.each(["javascript:alert(1)", "data:text/html,oi", "//outro-site.com"])("rejeita link de inscrição perigoso: %s", (url) => {
    const site = clonar();
    const eventos = site.secoes.find((s) => s.tipo === "eventos")!;
    if (eventos.tipo !== "eventos") throw new Error();
    eventos.itens[0].link = url;
    expect(siteSchema.safeParse(site).success).toBe(false);
  });

  it("aceita imagens enviadas e links https", () => {
    const site = clonar();
    site.topo.imagem = "/uploads/123e4567-e89b-12d3-a456-426614174000.jpg";
    const eventos = site.secoes.find((s) => s.tipo === "eventos")!;
    if (eventos.tipo !== "eventos") throw new Error();
    eventos.itens[0].link = "https://www.sympla.com.br/evento/123";
    expect(siteSchema.safeParse(site).success).toBe(true);
  });
});
