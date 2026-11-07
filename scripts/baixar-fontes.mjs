import { createHash } from "node:crypto";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const PASTA = path.join(RAIZ, "public", "fontes");
const SAIDA = path.join(RAIZ, "src", "lib", "fontes-css.ts");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

const FONTES = {
  playfair: ["Playfair Display", [400, 700]],
  lora: ["Lora", [400, 700]],
  merriweather: ["Merriweather", [400, 700]],
  cormorant: ["Cormorant Garamond", [400, 600, 700]],
  "dm-serif": ["DM Serif Display", [400]],
  montserrat: ["Montserrat", [400, 600, 700]],
  poppins: ["Poppins", [400, 600, 700]],
  inter: ["Inter", [400, 600, 700]],
  raleway: ["Raleway", [400, 600, 700]],
  lato: ["Lato", [400, 700]],
  "open-sans": ["Open Sans", [400, 600, 700]],
  nunito: ["Nunito", [400, 600, 700]],
};

await rm(PASTA, { recursive: true, force: true });
await mkdir(PASTA, { recursive: true });

const css = {};
const principal = {};
for (const [chave, [familia, pesos]] of Object.entries(FONTES)) {
  const url = `https://fonts.googleapis.com/css2?family=${familia.replace(/ /g, "+")}:wght@${pesos.join(";")}&display=swap`;
  const resp = await fetch(url, { headers: { "User-Agent": UA } });
  if (!resp.ok) throw new Error(`${familia}: HTTP ${resp.status}`);
  const texto = await resp.text();
  const blocos = [...texto.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)].filter(([, subset]) => subset === "latin");
  if (blocos.length === 0) throw new Error(`${familia}: nenhum bloco latin`);
  const regras = [];
  for (const [, , corpo] of blocos) {
    const arquivoUrl = corpo.match(/url\((https:[^)]+\.woff2)\)/)[1];
    const peso = corpo.match(/font-weight:\s*(\d+)/)[1];
    const estilo = corpo.match(/font-style:\s*(\w+)/)[1];
    const faixa = corpo.match(/unicode-range:\s*([^;]+);/)[1].trim();
    const nome = `${chave}-${createHash("sha1").update(arquivoUrl).digest("hex").slice(0, 8)}.woff2`;
    const destino = path.join(PASTA, nome);
    const bin = Buffer.from(await (await fetch(arquivoUrl, { headers: { "User-Agent": UA } })).arrayBuffer());
    await writeFile(destino, bin);
    regras.push(
      `@font-face{font-family:'${familia}';font-style:${estilo};font-weight:${peso};font-display:swap;src:url(/fontes/${nome}) format('woff2');unicode-range:${faixa}}`,
    );
    if (peso === "700" || !principal[chave]) principal[chave] = `/fontes/${nome}`;
  }
  css[chave] = [...new Set(regras)].join("");
  console.log(`${familia}: ${new Set(regras).size} regra(s)`);
}

const arquivos = await readdir(PASTA);
console.log(`${arquivos.length} arquivo(s) em public/fontes`);

await writeFile(
  SAIDA,
  `import type { ChaveFonte } from "./fontes";

type FonteWeb = Exclude<ChaveFonte, "georgia" | "sistema">;

export const FONTES_CSS: Record<FonteWeb, string> = ${JSON.stringify(css, null, 2)};

export const ARQUIVO_PRINCIPAL: Record<FonteWeb, string> = ${JSON.stringify(principal, null, 2)};

export function cssDasFontes(chaves: ChaveFonte[]): string {
  return [...new Set(chaves)].map((c) => (c in FONTES_CSS ? FONTES_CSS[c as FonteWeb] : "")).join("");
}

export function arquivoParaPreload(chave: ChaveFonte): string | null {
  return chave in ARQUIVO_PRINCIPAL ? ARQUIVO_PRINCIPAL[chave as FonteWeb] : null;
}
`,
);
console.log(`gerado ${path.relative(RAIZ, SAIDA)}`);
