import { cookies } from "next/headers";
import { COOKIE_SESSAO, tokenValido } from "./sessao";

export async function estaLogado(): Promise<boolean> {
  const c = await cookies();
  return tokenValido(c.get(COOKIE_SESSAO)?.value);
}
