import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_SESSAO = "coach_admin";
export const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000;

const sha256 = (v: string) => createHash("sha256").update(v).digest();

/** Segredo para assinar a sessão. Sem SESSION_SECRET, deriva da senha (trocar a senha derruba as sessões). */
function segredo(): string | null {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.ADMIN_PASSWORD) return sha256(`sessao:${process.env.ADMIN_PASSWORD}`).toString("hex");
  return null;
}

const assinar = (dado: string, chave: string) => createHmac("sha256", chave).update(dado).digest("hex");

export function painelConfigurado(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function senhaCorreta(senha: string): boolean {
  const esperada = process.env.ADMIN_PASSWORD;
  if (!esperada) return false;
  return timingSafeEqual(sha256(senha), sha256(esperada));
}

export function criarToken(agora = Date.now()): string {
  const chave = segredo();
  if (!chave) throw new Error("ADMIN_PASSWORD não configurada");
  const expira = String(agora + DURACAO_SESSAO_MS);
  return `${expira}.${assinar(expira, chave)}`;
}

export function tokenValido(token: string | undefined, agora = Date.now()): boolean {
  const chave = segredo();
  if (!chave || !token) return false;
  const [expira, assinatura] = token.split(".");
  if (!expira || !assinatura || !/^\d+$/.test(expira)) return false;
  const esperada = Buffer.from(assinar(expira, chave));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) return false;
  return Number(expira) > agora;
}
