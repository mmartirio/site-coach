import { fireEvent, render, screen } from "@testing-library/react";
import { CampoSenha } from "@/app/admin/CampoSenha";
import { CHAVES_FONTES } from "@/lib/fontes";
import { arquivoParaPreload, cssDasFontes, FONTES_CSS } from "@/lib/fontes-css";

describe("campo de senha do login", () => {
  it("começa oculto e o botão alterna entre mostrar e ocultar", () => {
    const { container } = render(<CampoSenha />);
    const campo = container.querySelector("input[name=senha]") as HTMLInputElement;
    expect(campo.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(campo.type).toBe("text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(campo.type).toBe("password");
  });

  it("o botão não envia o formulário", () => {
    render(<CampoSenha />);
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toHaveAttribute("type", "button");
  });
});

describe("fontes servidas pelo próprio site", () => {
  it("o tema padrão (Georgia + sistema) não baixa nenhuma fonte", () => {
    expect(cssDasFontes(["georgia", "sistema"])).toBe("");
    expect(arquivoParaPreload("georgia")).toBeNull();
  });

  it("só as fontes escolhidas entram no CSS", () => {
    const css = cssDasFontes(["playfair", "lato"]);
    expect(css).toContain("font-family:'Playfair Display'");
    expect(css).toContain("font-family:'Lato'");
    expect(css).not.toContain("Montserrat");
    expect(css).toMatch(/font-display:swap/);
  });

  it("todas as fontes web do painel têm arquivo local woff2", () => {
    const web = CHAVES_FONTES.filter((c) => c !== "georgia" && c !== "sistema");
    for (const c of web) {
      expect(FONTES_CSS[c as keyof typeof FONTES_CSS]).toMatch(/src:url\(\/fontes\/[a-z-]+-[0-9a-f]{8}\.woff2\)/);
      expect(arquivoParaPreload(c)).toMatch(/^\/fontes\/.+\.woff2$/);
    }
  });
});
