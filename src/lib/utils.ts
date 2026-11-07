import type { CSSProperties } from "react";
import { FAMILIAS } from "./familias";
import type { Tema } from "./schema";

export function whatsappLink(numero: string, mensagem: string): string {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem)}`;
}

export function linkExterno(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export function hrefDoBotao(destino: "whatsapp" | "link", link: string, mensagem: string, whatsapp: string): string {
  if (destino === "whatsapp") return whatsapp ? whatsappLink(whatsapp, mensagem) : "";
  return link;
}

export function atributosLink(href: string) {
  return linkExterno(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function varsDoTema(t: Tema): CSSProperties {
  return {
    "--cor-primaria": t.corPrimaria,
    "--cor-primaria-escura": t.corPrimariaEscura,
    "--cor-destaque": t.corDestaque,
    "--cor-texto": t.corTexto,
    "--cor-suave": t.corTextoSuave,
    "--cor-fundo": t.corFundo,
    "--cor-fundo-alt": t.corFundoSuave,
    "--cor-titulos": t.corTitulos,
    "--cor-cartao": t.corCartao,
    "--cor-texto-botao": t.corTextoBotao,
    "--fonte-titulos": FAMILIAS[t.fonteTitulos],
    "--fonte-texto": FAMILIAS[t.fonteTexto],
  } as CSSProperties;
}
