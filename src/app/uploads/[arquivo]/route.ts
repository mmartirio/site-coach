import { promises as fs } from "node:fs";
import path from "node:path";
import { DIR_UPLOADS } from "@/lib/armazenamento";
import { REGEX_ARQUIVO_UPLOAD, TIPOS_IMAGEM, type ExtensaoImagem } from "@/lib/imagens";

export async function GET(_req: Request, { params }: { params: Promise<{ arquivo: string }> }) {
  const { arquivo } = await params;
  if (!REGEX_ARQUIVO_UPLOAD.test(arquivo)) return new Response("Não encontrado", { status: 404 });
  try {
    const dados = await fs.readFile(path.join(DIR_UPLOADS, arquivo));
    const ext = arquivo.split(".").pop() as ExtensaoImagem;
    return new Response(new Uint8Array(dados), {
      headers: {
        "Content-Type": TIPOS_IMAGEM[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
