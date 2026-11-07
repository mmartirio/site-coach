"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { estaLogado } from "@/lib/auth";
import { salvarSite } from "@/lib/armazenamento";
import { siteSchema } from "@/lib/schema";
import { COOKIE_SESSAO, credenciaisCorretas, criarToken, DURACAO_SESSAO_MS } from "@/lib/sessao";

const cookieSeguro = () => process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false";

export async function entrar(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");
  if (!credenciaisCorretas(email, senha)) {
    await new Promise((r) => setTimeout(r, 1000));
    redirect("/admin/login?erro=1");
  }
  (await cookies()).set(COOKIE_SESSAO, criarToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSeguro(),
    path: "/",
    maxAge: DURACAO_SESSAO_MS / 1000,
  });
  redirect("/admin");
}

export async function sair() {
  (await cookies()).delete(COOKIE_SESSAO);
  redirect("/admin/login");
}

export type ResultadoSalvar = { ok: true } | { ok: false; erro: string };

export async function salvar(dados: unknown): Promise<ResultadoSalvar> {
  if (!(await estaLogado())) return { ok: false, erro: "Sua sessão expirou. Recarregue a página e entre novamente." };

  const r = siteSchema.safeParse(dados);
  if (!r.success) {
    const issue = r.error.issues[0];
    return { ok: false, erro: `${issue.message} — em ${descreverCaminho(issue.path, dados)}` };
  }

  await salvarSite(r.data);
  revalidatePath("/", "layout");
  return { ok: true };
}

function descreverCaminho(caminho: PropertyKey[], dados: unknown): string {
  const [raiz, i, sub, j] = caminho;
  if (raiz === "secoes" && typeof i === "number") {
    const titulo = (dados as { secoes?: { titulo?: string }[] })?.secoes?.[i]?.titulo;
    const partes = [`seção "${titulo || i + 1}"`];
    if (sub === "itens" && typeof j === "number") partes.push(`item ${j + 1}`);
    partes.push(String(caminho.at(-1)));
    return partes.join(" › ");
  }
  return caminho.map(String).join(" › ");
}
