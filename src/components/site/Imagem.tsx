import { getImageProps } from "next/image";
import { preload } from "react-dom";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  sizes: string;
  preload?: boolean;
  largura?: number;
  altura?: number;
};

export function Imagem({ src, alt = "", className, sizes, preload: principal, largura = 1200, altura = 800 }: Props) {
  const { props } = getImageProps({
    src,
    alt,
    width: largura,
    height: altura,
    sizes,
    unoptimized: /^https?:\/\//.test(src),
    loading: principal ? "eager" : "lazy",
    fetchPriority: principal ? "high" : undefined,
  });
  if (principal) {
    preload(props.src, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
    });
  }
  return <img {...props} alt={alt} className={className} decoding="async" />;
}
