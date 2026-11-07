import NextImage from "next/image";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  sizes: string;
  preload?: boolean;
  largura?: number;
  altura?: number;
};

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
