import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { conteudoPadrao } from "./conteudo-padrao";
import { siteSchema, type Site } from "./schema";

export const DIR_DADOS = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const DIR_UPLOADS = path.join(DIR_DADOS, "uploads");
const ARQUIVO_SITE = path.join(DIR_DADOS, "site.json");

export const lerSite = cache(async (): Promise<Site> => {
  try {
    const bruto = JSON.parse(await fs.readFile(ARQUIVO_SITE, "utf8"));
    const r = siteSchema.safeParse(bruto);
    if (r.success) return r.data;
    console.error("site.json inválido, usando conteúdo padrão:", r.error.issues[0]);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") console.error("Erro lendo site.json:", e);
  }
  return conteudoPadrao;
});

export async function dataDoConteudo(): Promise<Date> {
  try {
    return (await fs.stat(ARQUIVO_SITE)).mtime;
  } catch {
    return new Date();
  }
}

export async function salvarSite(site: Site): Promise<void> {
  await fs.mkdir(DIR_DADOS, { recursive: true });
  const tmp = `${ARQUIVO_SITE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(site, null, 2), "utf8");
  await fs.rename(tmp, ARQUIVO_SITE);
}
