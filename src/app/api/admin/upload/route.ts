import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { estaLogado } from "@/lib/auth";
import { DIR_UPLOADS } from "@/lib/armazenamento";
import { detectarTipoImagem, TAMANHO_MAXIMO_IMAGEM } from "@/lib/imagens";

export async function POST(req: Request) {
  if (!(await estaLogado())) return Response.json({ erro: "Sessão expirada. Entre novamente." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const arquivo = form?.get("arquivo");
  if (!(arquivo instanceof File)) return Response.json({ erro: "Nenhum arquivo enviado." }, { status: 400 });
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) return Response.json({ erro: "Imagem maior que 5 MB." }, { status: 413 });

  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const ext = detectarTipoImagem(bytes);
  if (!ext) return Response.json({ erro: "Formato não suportado. Use PNG, JPG, WEBP ou GIF." }, { status: 415 });

  const nome = `${randomUUID()}.${ext}`;
  await fs.mkdir(DIR_UPLOADS, { recursive: true });
  // A pasta de dados existe só em tempo de execução; o comentário evita que o build tente rastreá-la.
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ DIR_UPLOADS, nome), bytes);
  return Response.json({ url: `/uploads/${nome}` });
}
