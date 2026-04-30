import imagensRaw from "@/data/imagens-produtos.json";
import imagensCategoriasRaw from "@/data/imagens-categorias.json";
import type { Produto } from "./types";

const mapaImagens = imagensRaw as Record<string, string>;
const mapaImagensCategorias = imagensCategoriasRaw as Record<string, string>;

export function imagemProduto(p: Pick<Produto, "imageUrl" | "slug">): string {
  if (p.imageUrl) return p.imageUrl;
  if (p.slug && mapaImagens[p.slug]) return mapaImagens[p.slug];
  return "/products/placeholder.svg";
}

export function imagemLocalProduto(slug: string): string | null {
  return mapaImagens[slug] ?? null;
}

export function imagemLocalCategoria(slug: string): string | null {
  if (mapaImagensCategorias[slug]) return mapaImagensCategorias[slug];
  const slugUnderline = slug.replace(/-/g, "_");
  return mapaImagensCategorias[slugUnderline] ?? null;
}
