import "server-only";
import { unstable_cache } from "next/cache";
import imagensRaw from "@/data/imagens-produtos.json";
import imagensCategoriasRaw from "@/data/imagens-categorias.json";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { Categoria, Produto } from "./types";

const mapaImagens = imagensRaw as Record<string, string>;
const mapaImagensCategorias = imagensCategoriasRaw as Record<string, string>;

// =============================================================
// HELPERS
// =============================================================

function urlImagemCategoria(c: { slug: string; imagem_url: string | null }): string | null {
  if (c.imagem_url) {
    if (/^https?:\/\//i.test(c.imagem_url)) return c.imagem_url;
    if (c.imagem_url.startsWith("/")) {
      const m = /\/categories\/([^.]+)\.[a-z]+$/i.exec(c.imagem_url);
      if (m && mapaImagensCategorias[m[1]]) return mapaImagensCategorias[m[1]];
    }
    if (c.imagem_url.startsWith("/")) return c.imagem_url;
  }
  if (mapaImagensCategorias[c.slug]) return mapaImagensCategorias[c.slug];
  const slugUnderline = c.slug.replace(/-/g, "_");
  if (mapaImagensCategorias[slugUnderline]) return mapaImagensCategorias[slugUnderline];
  return null;
}

function urlImagemProduto(slug: string, imagemUrl: string | null): string | null {
  if (imagemUrl && /^https?:\/\//i.test(imagemUrl)) return imagemUrl;
  if (imagemUrl && imagemUrl.startsWith("/")) {
    const local = mapaImagens[slug];
    return local || imagemUrl;
  }
  if (mapaImagens[slug]) return mapaImagens[slug];
  return imagemUrl || null;
}

function mapearCategoria(row: Record<string, unknown>): Categoria {
  return {
    id: row.id as string,
    name: row.nome as string,
    slug: row.slug as string,
    description: (row.descricao as string) || null,
    icon: (row.icone as string) || null,
    imageUrl: urlImagemCategoria({ slug: row.slug as string, imagem_url: (row.imagem_url as string) || null }),
    sortOrder: (row.ordem as number) ?? 0,
    createdAt: row.criado_em as string,
    updatedAt: row.atualizado_em as string,
  };
}

function mapearProduto(row: Record<string, unknown>, categoriasPorId?: Map<string, Categoria>): Produto {
  const slug = row.slug as string;
  const cat = categoriasPorId?.get(row.categoria_id as string) ?? null;
  return {
    id: row.id as string,
    name: (row.nome as string) || "",
    slug,
    description: (row.descricao as string) || null,
    brand: (row.marca as string) || null,
    volume: (row.volume as string) || null,
    alcoholContent: (row.teor_alcoolico as string) || null,
    temperature: (row.temperatura as string) || null,
    price: row.preco != null ? Number(row.preco) : null,
    promoPrice: row.preco_promocional != null ? Number(row.preco_promocional) : null,
    imageUrl: urlImagemProduto(slug, (row.imagem_url as string) || null),
    inStock: (row.em_estoque as boolean) ?? true,
    featured: (row.destaque as boolean) ?? false,
    bestSeller: (row.mais_vendido as boolean) ?? false,
    isNew: (row.novo as boolean) ?? false,
    sortOrder: (row.ordem as number) ?? 0,
    categoryId: row.categoria_id as string,
    createdAt: row.criado_em as string,
    updatedAt: row.atualizado_em as string,
    category: cat,
  };
}

// =============================================================
// FETCHERS (com cache do Next, invalidados via revalidateTag)
// =============================================================

const carregarTudo = unstable_cache(
  async () => {
    const sb = createSupabaseAdmin();
    const [{ data: cats, error: errCats }, { data: prods, error: errProds }] = await Promise.all([
      sb.from("categorias").select("*").order("ordem", { ascending: true }),
      sb.from("produtos").select("*").order("ordem", { ascending: true }),
    ]);
    if (errCats) throw new Error(`categorias: ${errCats.message}`);
    if (errProds) throw new Error(`produtos: ${errProds.message}`);

    const categorias = (cats ?? []).map(mapearCategoria);
    const catsPorId = new Map(categorias.map((c) => [c.id, c]));
    const produtos = (prods ?? []).map((p) => mapearProduto(p, catsPorId));
    return { categorias, produtos };
  },
  ["catalogo:tudo"],
  { tags: ["catalogo"], revalidate: 300 },
);

// =============================================================
// API publica (mesma interface de antes, agora async)
// =============================================================

export async function listarCategorias(): Promise<Categoria[]> {
  const { categorias } = await carregarTudo();
  return categorias;
}

export async function listarCategoriasPublicadas(): Promise<Categoria[]> {
  return (await listarCategorias()).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function listarProdutos(): Promise<Produto[]> {
  const { produtos } = await carregarTudo();
  return produtos;
}

export async function buscarProduto(slug: string): Promise<Produto | undefined> {
  const { produtos } = await carregarTudo();
  return produtos.find((p) => p.slug === slug);
}

export async function buscarCategoria(slug: string): Promise<Categoria | undefined> {
  const { categorias } = await carregarTudo();
  return categorias.find((c) => c.slug === slug);
}

export async function produtosDaCategoria(slugCategoria: string): Promise<Produto[]> {
  const { produtos } = await carregarTudo();
  return produtos
    .filter((p) => p.category?.slug === slugCategoria)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function relacionadosDe(produto: Produto, max = 8): Promise<Produto[]> {
  if (!produto.category) return [];
  const { produtos } = await carregarTudo();
  return produtos
    .filter((p) => p.category?.slug === produto.category?.slug && p.slug !== produto.slug)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, max);
}

export async function destaques(max = 12): Promise<Produto[]> {
  const { produtos } = await carregarTudo();
  return produtos
    .filter((p) => p.bestSeller || p.featured)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, max);
}

export async function ofertas(max = 12): Promise<Produto[]> {
  const { produtos } = await carregarTudo();
  return produtos
    .filter((p) => p.price && p.promoPrice && (p.promoPrice as number) < (p.price as number))
    .sort((a, b) => {
      const da = (a.price! - a.promoPrice!) / a.price!;
      const db = (b.price! - b.promoPrice!) / b.price!;
      return db - da;
    })
    .slice(0, max);
}

