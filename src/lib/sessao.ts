import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_SESSAO = "coach_admin";
export const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000;

const sha256 = (v: string) => createHash("sha256").update(v).digest();
const normalizarEmail = (v: string) => v.trim().toLowerCase();
const iguais = (a: string, b: string) => timingSafeEqual(sha256(a), sha256(b));

function credenciais(): { email: string; senha: string } | null {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_PASSWORD;
  return email && senha ? { email: normalizarEmail(email), senha } : null;
}

function segredo(): string | null {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const c = credenciais();
  return c ? sha256(`sessao:${c.email}:${c.senha}`).toString("hex") : null;
}

const assinar = (dado: string, chave: string) => createHmac("sha256", chave).update(dado).digest("hex");

export function painelConfigurado(): boolean {
  return credenciais() !== null;
}

export function credenciaisCorretas(email: string, senha: string): boolean {
  const c = credenciais();
  if (!c) return false;
  const emailOk = iguais(normalizarEmail(email), c.email);
  const senhaOk = iguais(senha, c.senha);
  return emailOk && senhaOk;
}

export function criarToken(agora = Date.now()): string {
  const chave = segredo();
  if (!chave) throw new Error("ADMIN_EMAIL e ADMIN_PASSWORD não configurados");
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
