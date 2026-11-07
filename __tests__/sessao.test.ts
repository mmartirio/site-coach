/** @jest-environment node */
import { credenciaisCorretas, criarToken, DURACAO_SESSAO_MS, painelConfigurado, tokenValido } from "@/lib/sessao";
import { detectarTipoImagem } from "@/lib/imagens";

describe("sessão do painel", () => {
  const original = { ...process.env };
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "Coach@Exemplo.com.br";
    process.env.ADMIN_PASSWORD = "senha-de-teste";
    delete process.env.SESSION_SECRET;
  });
  afterAll(() => {
    process.env = original;
  });

  it("confere e-mail e senha juntos", () => {
    expect(credenciaisCorretas("coach@exemplo.com.br", "senha-de-teste")).toBe(true);
    expect(credenciaisCorretas("coach@exemplo.com.br", "errada")).toBe(false);
    expect(credenciaisCorretas("outra@exemplo.com.br", "senha-de-teste")).toBe(false);
    expect(credenciaisCorretas("", "")).toBe(false);
  });

  it("o e-mail não diferencia maiúsculas nem espaços nas pontas; a senha diferencia", () => {
    expect(credenciaisCorretas("  COACH@exemplo.COM.BR ", "senha-de-teste")).toBe(true);
    expect(credenciaisCorretas("coach@exemplo.com.br", "SENHA-DE-TESTE")).toBe(false);
  });

  it("sem ADMIN_EMAIL ou sem ADMIN_PASSWORD, o painel fica desativado", () => {
    delete process.env.ADMIN_EMAIL;
    expect(painelConfigurado()).toBe(false);
    expect(credenciaisCorretas("coach@exemplo.com.br", "senha-de-teste")).toBe(false);
    expect(tokenValido("123.abc")).toBe(false);
    process.env.ADMIN_EMAIL = "coach@exemplo.com.br";
    delete process.env.ADMIN_PASSWORD;
    expect(painelConfigurado()).toBe(false);
  });

  it("aceita o token criado e recusa depois de expirar", () => {
    const agora = Date.now();
    const token = criarToken(agora);
    expect(tokenValido(token, agora + 1000)).toBe(true);
    expect(tokenValido(token, agora + DURACAO_SESSAO_MS + 1)).toBe(false);
  });

  it("recusa token adulterado", () => {
    const [, assinatura] = criarToken().split(".");
    const daquiAUmAno = String(Date.now() + 365 * 24 * 3600 * 1000);
    expect(tokenValido(`${daquiAUmAno}.${assinatura}`)).toBe(false);
    expect(tokenValido("lixo")).toBe(false);
    expect(tokenValido(undefined)).toBe(false);
  });

  it("trocar a senha ou o e-mail invalida as sessões abertas", () => {
    const token = criarToken();
    process.env.ADMIN_PASSWORD = "nova-senha";
    expect(tokenValido(token)).toBe(false);
    process.env.ADMIN_PASSWORD = "senha-de-teste";
    expect(tokenValido(token)).toBe(true);
    process.env.ADMIN_EMAIL = "nova@exemplo.com.br";
    expect(tokenValido(token)).toBe(false);
  });
});

describe("detectarTipoImagem", () => {
  const bytes = (...v: (number | string)[]) =>
    new Uint8Array(v.flatMap((x) => (typeof x === "string" ? [...x].map((c) => c.charCodeAt(0)) : [x])));

  it("reconhece os formatos pelos primeiros bytes", () => {
    expect(detectarTipoImagem(bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(detectarTipoImagem(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpg");
    expect(detectarTipoImagem(bytes("GIF89a"))).toBe("gif");
    expect(detectarTipoImagem(bytes("RIFF", 0, 0, 0, 0, "WEBP"))).toBe("webp");
  });

  it("recusa SVG, HTML e arquivos renomeados", () => {
    expect(detectarTipoImagem(bytes("<svg xmlns="))).toBeNull();
    expect(detectarTipoImagem(bytes("<html><script>"))).toBeNull();
    expect(detectarTipoImagem(bytes(""))).toBeNull();
  });
});
