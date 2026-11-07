import { z } from "zod";
import { CHAVES_FONTES } from "./fontes";

const cor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (use o formato #RRGGBB)");
const txt = (max: number) => z.string().max(max, `Texto muito longo (máx. ${max} caracteres)`);
const id = z.string().regex(/^[a-z0-9-]{1,40}$/, "Identificador inválido");

// Só aceitamos imagens enviadas pelo painel, imagens do próprio site ou https.
export const REGEX_IMAGEM = /^(\/uploads\/[a-z0-9-]+\.(png|jpe?g|webp|gif)|\/imagens\/[a-z0-9-]+\.(svg|png|jpe?g|webp)|https:\/\/[^\s"'<>]+)$/;
const imagem = z.string().max(500).refine((v) => v === "" || REGEX_IMAGEM.test(v), "Endereço de imagem inválido");
const link = z
  .string()
  .max(500)
  // Externo (http/https) ou caminho interno "/..." — "//" e "/\" são recusados porque o navegador os trata como outro site.
  .refine(
    (v) => v === "" || /^https?:\/\/[^\s"'<>]+$/.test(v) || /^\/(?![/\\])[^\s"'<>\\]*$/.test(v) || /^#[a-z0-9-]+$/i.test(v),
    "Link inválido (use https://... ou #secao)",
  );

/** Preenche as cores que não existiam nos site.json antigos, mantendo o visual de antes. */
function completarTema(v: unknown) {
  if (!v || typeof v !== "object") return v;
  const t = v as Record<string, unknown>;
  return { corTitulos: t.corPrimariaEscura, corCartao: "#ffffff", corTextoBotao: "#ffffff", ...t };
}

export const temaSchema = z.preprocess(completarTema, z.object({
  corPrimaria: cor,
  corPrimariaEscura: cor,
  corDestaque: cor,
  corTexto: cor,
  corTextoSuave: cor,
  corFundo: cor,
  corFundoSuave: cor,
  corTitulos: cor,
  corCartao: cor,
  corTextoBotao: cor,
  fonteTitulos: z.enum(CHAVES_FONTES),
  fonteTexto: z.enum(CHAVES_FONTES),
}));

export const itemSchema = z.object({
  id,
  icone: txt(16),
  titulo: txt(150),
  texto: txt(2000),
  lista: z.array(txt(200)).max(20),
  imagem,
  data: txt(100),
  local: txt(150),
  link,
  // Campos de palestras/treinamentos. Os .default/.catch mantêm válidos os site.json salvos antes deles.
  formato: z.enum(["palestra", "treinamento"]).catch("palestra"),
  duracao: txt(100).default(""),
  preco: txt(60).default(""),
});

// Blocos extras que podem ser colocados em qualquer seção, acima ou abaixo do conteúdo dela.
const posicao = z.enum(["antes", "depois"]).catch("depois");
// Para onde um botão leva: WhatsApp (com mensagem pronta) ou um link.
const destino = z.enum(["whatsapp", "link"]).catch("whatsapp");
export const blocoSchema = z.discriminatedUnion("tipo", [
  z.object({ id, tipo: z.literal("subtitulo"), texto: txt(200), posicao }),
  z.object({ id, tipo: z.literal("texto"), texto: txt(5000), posicao }),
  z.object({ id, tipo: z.literal("imagem"), imagem, legenda: txt(200), largura: z.enum(["normal", "larga"]).catch("normal"), posicao }),
  z.object({
    id,
    tipo: z.literal("botao"),
    texto: txt(60),
    destino,
    link,
    mensagemWhatsapp: txt(300),
    estilo: z.enum(["cheio", "contorno"]).catch("cheio"),
    posicao,
  }),
]);

const base = {
  id,
  titulo: txt(150),
  visivel: z.boolean(),
  noMenu: z.boolean(),
  fundo: z.enum(["claro", "suave", "destaque"]),
  // .default([]) mantém válidos os site.json salvos antes dos blocos existirem.
  blocos: z.array(blocoSchema).max(30).default([]),
};

export const secaoSchema = z.discriminatedUnion("tipo", [
  z.object({ ...base, tipo: z.literal("texto"), texto: txt(5000), imagem, imagemLado: z.enum(["esquerda", "direita"]) }),
  z.object({ ...base, tipo: z.literal("cards"), introducao: txt(1000), itens: z.array(itemSchema).max(24) }),
  z.object({ ...base, tipo: z.literal("eventos"), introducao: txt(1000), botaoTexto: txt(40), itens: z.array(itemSchema).max(24) }),
  z.object({ ...base, tipo: z.literal("galeria"), introducao: txt(1000), itens: z.array(itemSchema).max(60) }),
  z.object({ ...base, tipo: z.literal("etapas"), introducao: txt(1000), itens: z.array(itemSchema).max(12) }),
  z.object({
    ...base,
    tipo: z.literal("cta"),
    texto: txt(1000),
    botaoTexto: txt(60),
    destino,
    link,
    mensagemWhatsapp: txt(300),
    botao2Texto: txt(60).default(""),
    botao2Link: link.default(""),
  }),
  z.object({ ...base, tipo: z.literal("contato"), texto: txt(1000), botaoTexto: txt(60), mensagemWhatsapp: txt(300) }),
]);

// SEO e Google. Campos vazios = recurso desligado.
export const seoSchema = z.object({
  /** Endereço público do site (https://...), usado no sitemap, no link canônico e no compartilhamento. */
  urlSite: z.string().max(200).refine((v) => v === "" || /^https?:\/\/[a-z0-9.-]+(:\d+)?\/?$/i.test(v), "Endereço do site inválido (ex.: https://www.seusite.com.br)"),
  /** Código da meta tag google-site-verification do Search Console. */
  googleVerificacao: z.string().regex(/^[A-Za-z0-9_-]{0,100}$/, "Código de verificação do Google inválido"),
  /** ID de medição do Google Analytics 4. */
  googleAnalyticsId: z.string().regex(/^(G-[A-Z0-9]{4,20})?$/, "ID do Google Analytics inválido (formato G-XXXXXXXXXX)"),
  /** Imagem que aparece ao compartilhar o link (WhatsApp, redes sociais). */
  imagemCompartilhamento: imagem,
});
export const SEO_VAZIO = { urlSite: "", googleVerificacao: "", googleAnalyticsId: "", imagemCompartilhamento: "" };

export const siteSchema = z.object({
  tema: temaSchema,
  info: z.object({
    nome: txt(80).min(1, "Informe o nome"),
    titulo: txt(120),
    descricao: txt(300),
    email: txt(200),
    whatsapp: z.string().regex(/^\d{0,15}$/, "WhatsApp: use só dígitos (DDI + DDD + número)"),
    instagram: link,
  }),
  topo: z.object({
    rotulo: txt(80),
    titulo: txt(150),
    subtitulo: txt(400),
    botaoTexto: txt(60),
    mensagemWhatsapp: txt(300),
    imagem,
    blocos: z.array(blocoSchema).max(30).default([]),
  }),
  secoes: z.array(secaoSchema).max(30),
  rodape: txt(200),
  seo: seoSchema.default(SEO_VAZIO),
});

export type Tema = z.infer<typeof temaSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Secao = z.infer<typeof secaoSchema>;
export type Bloco = z.infer<typeof blocoSchema>;
export type TipoBloco = Bloco["tipo"];
export type TipoSecao = Secao["tipo"];
export type Site = z.infer<typeof siteSchema>;
export type Seo = z.infer<typeof seoSchema>;
