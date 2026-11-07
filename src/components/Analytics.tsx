"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const CHAVE_CONSENTIMENTO = "consentimento-analytics";
const EVENTO_ABRIR = "abrir-preferencias-cookies";
type Escolha = "aceito" | "recusado";

/** Remove os cookies do Google Analytics (_ga, _ga_XXXX) ao recusar. */
function apagarCookiesGa() {
  const dominios = ["", location.hostname, `.${location.hostname.replace(/^www\./, "")}`];
  for (const c of document.cookie.split(";")) {
    const nome = c.split("=")[0].trim();
    if (!nome.startsWith("_ga")) continue;
    for (const d of dominios) document.cookie = `${nome}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
  }
}

/** Registra no GA os cliques que importam para a coach: WhatsApp, e-mail e inscrições em eventos. */
function registrarClique(e: MouseEvent) {
  const a = (e.target as Element | null)?.closest?.("a");
  if (!a || !window.gtag) return;
  const href = a.getAttribute("href") ?? "";
  const texto = (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 100);
  if (href.includes("wa.me/")) window.gtag("event", "generate_lead", { method: "whatsapp", link_text: texto });
  else if (href.startsWith("mailto:")) window.gtag("event", "generate_lead", { method: "email", link_text: texto });
  else if (a.classList.contains("evento--link")) window.gtag("event", "select_content", { content_type: "inscricao", item_id: texto, link_url: href });
}

/**
 * Google Analytics 4 só depois do consentimento (LGPD): até a pessoa aceitar, nenhum script ou cookie
 * do Google é carregado — o que também mantém a página leve no PageSpeed.
 */
export function Analytics({ id }: { id: string }) {
  // undefined = ainda lendo o localStorage (evita piscar o aviso); null = não escolheu
  const [escolha, setEscolha] = useState<Escolha | null | undefined>(undefined);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_CONSENTIMENTO);
    setEscolha(salvo === "aceito" || salvo === "recusado" ? salvo : null);
    const abrir = () => setEscolha(null);
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR, abrir);
  }, []);

  useEffect(() => {
    if (escolha !== "aceito") return;
    document.addEventListener("click", registrarClique);
    return () => document.removeEventListener("click", registrarClique);
  }, [escolha]);

  function escolher(nova: Escolha) {
    const tinhaAceitado = localStorage.getItem(CHAVE_CONSENTIMENTO) === "aceito";
    localStorage.setItem(CHAVE_CONSENTIMENTO, nova);
    setEscolha(nova);
    if (nova === "recusado") {
      apagarCookiesGa();
      if (tinhaAceitado) location.reload(); // descarrega o script que já estava rodando
    }
  }

  return (
    <>
      {escolha === "aceito" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(id)});`}
          </Script>
        </>
      )}
      {escolha === null && (
        <div className="cookies" role="dialog" aria-live="polite" aria-label="Aviso de cookies">
          <p>
            Usamos cookies do Google Analytics para entender como o site é usado e melhorar o conteúdo. Você pode aceitar ou recusar.
          </p>
          <div className="cookies__acoes">
            <button type="button" className="btn btn--ghost btn--small" onClick={() => escolher("recusado")}>
              Recusar
            </button>
            <button type="button" className="btn btn--small" onClick={() => escolher("aceito")}>
              Aceitar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Link do rodapé para rever a escolha de cookies. */
export function BotaoCookies() {
  return (
    <button type="button" className="footer__cookies" onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR))}>
      Preferências de cookies
    </button>
  );
}
