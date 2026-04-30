import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { ProdutoForm } from "../produto-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Editar produto — Zé Chegou 24h", robots: { index: false } };

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const admin = createSupabaseAdmin();
  const [{ data: prod }, { data: cats }] = await Promise.all([
    admin.from("produtos").select("*").eq("id", params.id).maybeSingle(),
    admin.from("categorias").select("id, nome").order("ordem", { ascending: true }),
  ]);

  if (!prod) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-dark"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <Link
          href={`/produto/${prod.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-dark"
        >
          Ver no site <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
      <h1 className="font-extrabold text-2xl text-brand-dark mb-5">Editar produto</h1>
      <ProdutoForm
        modo="editar"
        categorias={cats ?? []}
        inicial={{
          id: prod.id,
          nome: prod.nome,
          slug: prod.slug,
          descricao: prod.descricao,
          marca: prod.marca,
          volume: prod.volume,
          teor_alcoolico: prod.teor_alcoolico,
          temperatura: prod.temperatura,
          preco: prod.preco != null ? Number(prod.preco) : null,
          preco_promocional: prod.preco_promocional != null ? Number(prod.preco_promocional) : null,
          imagem_url: prod.imagem_url,
          em_estoque: prod.em_estoque,
          destaque: prod.destaque,
          mais_vendido: prod.mais_vendido,
          novo: prod.novo,
          ordem: prod.ordem,
          publicado: prod.publicado,
          categoria_id: prod.categoria_id,
        }}
      />
    </div>
  );
}
