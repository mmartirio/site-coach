import NextImage from "next/image";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  /** Largura em que a imagem aparece na tela (atributo sizes), para o navegador baixar o tamanho certo. */
  sizes: string;
  /** Imagem principal da página (LCP): baixada antes das outras. */
  preload?: boolean;
  /** Proporção aproximada; o CSS de cada lugar define o recorte final. */
  largura?: number;
  altura?: number;
};

/**
 * Imagem otimizada pelo Next (AVIF/WebP, tamanhos por tela, carregamento sob demanda).
 * Imagens externas (https://...) e SVGs vão sem otimização: o Next não processa SVG e não sabemos o host externo.
 */
export function Imagem({ src, alt = "", className, sizes, preload, largura = 1200, altura = 800 }: Props) {
  return (
    <NextImage
      src={src}
      alt={alt}
      className={className}
      width={largura}
      height={altura}
      sizes={sizes}
      preload={preload}
      unoptimized={/^https?:\/\//.test(src)}
    />
  );
}
