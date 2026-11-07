"use client";

export const EVENTO_ABRIR_COOKIES = "abrir-preferencias-cookies";

export function BotaoCookies() {
  return (
    <button type="button" className="footer__cookies" onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR_COOKIES))}>
      Preferências de cookies
    </button>
  );
}
