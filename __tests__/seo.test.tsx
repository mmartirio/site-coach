import { act, fireEvent, render, screen } from "@testing-library/react";
import { Analytics, CHAVE_CONSENTIMENTO } from "@/components/Analytics";
import { SiteView } from "@/components/site/SiteView";
import { conteudoPadrao } from "@/lib/conteudo-padrao";
import { siteSchema, type Site } from "@/lib/schema";
import { dadosEstruturados, imagemCompartilhamento, jsonLd } from "@/lib/seo";

jest.mock("next/headers", () => ({ headers: jest.fn() }));

const clonar = (): Site => structuredClone(conteudoPadrao);

describe("validação dos campos do Google", () => {
  it.each([
    ["urlSite", "https://www.coach.com.br", true],
    ["urlSite", "https://www.coach.com.br/", true],
    ["urlSite", "javascript:alert(1)", false],
    ["urlSite", "https://coach.com.br/pagina?x=1", false],
    ["googleAnalyticsId", "G-ABC123XYZ9", true],
    ["googleAnalyticsId", "UA-12345-1", false],
    ["googleAnalyticsId", "G-1');alert(1)//", false],
    ["googleVerificacao", "aBc-123_XyZ", true],
    ["googleVerificacao", '"><script>', false],
  ] as const)("%s = %s → %s", (campo, valor, valido) => {
    const site = clonar();
    site.seo[campo] = valor;
    expect(siteSchema.safeParse(site).success).toBe(valido);
  });

  it("conteúdo salvo antes dos campos do Google continua válido", () => {
    const antigo = JSON.parse(JSON.stringify(conteudoPadrao));
    delete antigo.seo;
    const r = siteSchema.safeParse(antigo);
    expect(r.success && r.data.seo.googleAnalyticsId).toBe("");
  });
});

describe("dados estruturados (schema.org)", () => {
  it("descrevem o serviço profissional com contato e serviços", () => {
    const d = dadosEstruturados(conteudoPadrao, "https://www.coach.com.br");
    expect(d["@type"]).toBe("ProfessionalService");
    expect(d.url).toBe("https://www.coach.com.br/");
    expect(d.telephone).toBe(`+${conteudoPadrao.info.whatsapp}`);
    expect(d.image).toBe("https://www.coach.com.br/og");
    const nomes = d.hasOfferCatalog!.itemListElement.map((o) => o.itemOffered.name);
    expect(nomes).toContain("Coach Pessoal e Profissional");
    expect(nomes).toContain("Liderança com Propósito");
  });

  it("o JSON não consegue fechar a tag <script>", () => {
    const html = jsonLd({ nome: "</script><script>alert(1)</script>" });
    expect(html).not.toContain("</script>");
    expect(JSON.parse(html).nome).toBe("</script><script>alert(1)</script>");
  });

  it("imagem de compartilhamento: painel → foto do topo → imagem gerada", () => {
    const site = clonar();
    expect(imagemCompartilhamento(site)).toBe("/og");
    site.topo.imagem = "/uploads/topo.jpg";
    expect(imagemCompartilhamento(site)).toBe("/uploads/topo.jpg");
    site.seo.imagemCompartilhamento = "/uploads/share.jpg";
    expect(imagemCompartilhamento(site)).toBe("/uploads/share.jpg");
  });
});

describe("Google Analytics com consentimento (LGPD)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.querySelectorAll("script").forEach((s) => s.remove());
  });
  const scriptsGoogle = () => [...document.querySelectorAll("script")].filter((s) => (s.src || s.textContent || "").includes("googletagmanager"));

  it("não carrega nada do Google antes de aceitar", () => {
    render(<Analytics id="G-TESTE12345" />);
    expect(screen.getByRole("dialog", { name: /cookies/i })).toBeInTheDocument();
    expect(scriptsGoogle()).toHaveLength(0);
  });

  it("aceitar guarda a escolha e esconde o aviso", () => {
    render(<Analytics id="G-TESTE12345" />);
    fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));
    expect(localStorage.getItem(CHAVE_CONSENTIMENTO)).toBe("aceito");
    expect(screen.queryByRole("dialog", { name: /cookies/i })).toBeNull();
  });

  it("recusar guarda a escolha e não carrega o Google", () => {
    render(<Analytics id="G-TESTE12345" />);
    fireEvent.click(screen.getByRole("button", { name: "Recusar" }));
    expect(localStorage.getItem(CHAVE_CONSENTIMENTO)).toBe("recusado");
    expect(scriptsGoogle()).toHaveLength(0);
  });

  it("quem já escolheu não vê o aviso de novo, mas pode reabrir pelo rodapé", async () => {
    localStorage.setItem(CHAVE_CONSENTIMENTO, "recusado");
    const { BotaoCookies } = await import("@/components/Analytics");
    render(
      <>
        <Analytics id="G-TESTE12345" />
        <BotaoCookies />
      </>,
    );
    expect(screen.queryByRole("dialog", { name: /cookies/i })).toBeNull();
    act(() => fireEvent.click(screen.getByRole("button", { name: "Preferências de cookies" })));
    expect(screen.getByRole("dialog", { name: /cookies/i })).toBeInTheDocument();
  });

  it("o rodapé do site aceita o link de preferências", () => {
    render(<SiteView site={conteudoPadrao} rodapeExtra={<button type="button">Preferências de cookies</button>} />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Preferências de cookies");
  });
});
