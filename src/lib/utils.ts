import type { CSSProperties } from "react";
import { FAMILIAS } from "./fontes-carregadas";
import type { Tema } from "./schema";

export function whatsappLink(numero: string, mensagem: string): string {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem)}`;
}

export function linkExterno(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/** Endereço de um botão de CTA: WhatsApp com mensagem pronta ou o link informado. Vazio se não houver destino. */
export function hrefDoBotao(destino: "whatsapp" | "link", link: string, mensagem: string, whatsapp: string): string {
  if (destino === "whatsapp") return whatsapp ? whatsappLink(whatsapp, mensagem) : "";
  return link;
}

/** Links externos abrem em nova aba. */
export function atributosLink(href: string) {
  return linkExterno(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

/** Variáveis CSS do tema, aplicadas no <html>. */
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
