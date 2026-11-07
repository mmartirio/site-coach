export const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;

export const TIPOS_IMAGEM = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
} as const;
export type ExtensaoImagem = keyof typeof TIPOS_IMAGEM;

/** Identifica o formato pelos primeiros bytes (não confia no nome nem no tipo enviado pelo navegador). */
export function detectarTipoImagem(b: Uint8Array): ExtensaoImagem | null {
  const ascii = (ini: number, fim: number) => String.fromCharCode(...b.slice(ini, fim));
  if (b.length >= 8 && b[0] === 0x89 && ascii(1, 4) === "PNG") return "png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 6 && (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a")) return "gif";
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

export const REGEX_ARQUIVO_UPLOAD = /^[a-z0-9-]+\.(png|jpg|webp|gif)$/;
