import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { ProdutoForm } from "../produto-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Novo produto — Zé Chegou 24h", robots: { index: false } };

export default async function NovoProdutoPage({
  searchParams,
}: {
  searchParams?: { cat?: string };
}) {
  const admin = createSupabaseAdmin();
  const { data: cats } = await admin
    .from("categorias")
    .select("id, nome")
    .order("ordem", { ascending: true });

  return (
    <div>
      <Link
        href="/admin/produtos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-dark mb-3"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="font-extrabold text-2xl text-brand-dark mb-5">Novo produto</h1>
      <ProdutoForm
        modo="novo"
        categorias={cats ?? []}
        inicial={{
          nome: "",
          slug: "",
          descricao: "",
          marca: "",
          volume: "",
          teor_alcoolico: "",
          temperatura: "",
          preco: null,
          preco_promocional: null,
          imagem_url: "",
          em_estoque: true,
          destaque: false,
          mais_vendido: false,
          novo: true,
          ordem: 0,
          publicado: true,
          categoria_id: searchParams?.cat ?? "",
        }}
      />
    </div>
  );
}
