import Link from "next/link";
import { Plus } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { CategoriasReorderClient } from "./reorder-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Categorias — Zé Chegou 24h", robots: { index: false } };

export default async function CategoriasPage() {
  const admin = createSupabaseAdmin();
  const { data: categorias } = await admin
    .from("categorias")
    .select("id, nome, slug, icone, imagem_url, ordem, publicada")
    .order("ordem", { ascending: true });

  const ids = (categorias ?? []).map((c) => c.id);
  let contagens: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: prods } = await admin
      .from("produtos")
      .select("categoria_id")
      .in("categoria_id", ids);
    if (prods) {
      contagens = prods.reduce<Record<string, number>>((acc, p) => {
        const k = p.categoria_id as string;
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {});
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-extrabold text-2xl text-brand-dark">Categorias</h1>
          <p className="text-sm text-gray-500">
            Arraste pra reordenar. Mude a ordem que aparece no site.
          </p>
        </div>
        <Link
          href="/admin/categorias/nova"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-sm font-bold bg-brand-yellow text-brand-dark active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova
        </Link>
      </div>

      <CategoriasReorderClient
        categorias={(categorias ?? []).map((c) => ({
          id: c.id,
          nome: c.nome,
          slug: c.slug,
          icone: c.icone,
          imagem_url: c.imagem_url,
          ordem: c.ordem,
          publicada: c.publicada,
          totalProdutos: contagens[c.id] ?? 0,
        }))}
      />
    </div>
  );
}
