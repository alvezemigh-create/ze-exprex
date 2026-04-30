"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

const PLACEHOLDER = "/products/placeholder.svg";

type Props = Omit<ImageProps, "src" | "alt" | "onError"> & {
  src: string;
  alt: string;
};

/**
 * Next/Image com fallback pro placeholder quando o src quebra (404, CORS, etc.).
 * Evita exibir o texto do alt gigante no lugar da foto.
 */
export function SafeProductImage({ src, alt, ...rest }: Props) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  const isPh = current === PLACEHOLDER;

  return (
    <Image
      {...rest}
      src={current}
      alt={isPh ? "" : alt}
      onError={() => setCurrent(PLACEHOLDER)}
    />
  );
}
