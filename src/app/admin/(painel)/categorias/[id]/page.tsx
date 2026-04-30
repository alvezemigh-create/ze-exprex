import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { CategoriaForm } from "../categoria-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Editar categoria — Zé Chegou 24h", robots: { index: false } };

export default async function EditarCategoriaPage({ params }: { params: { id: string } }) {
  const admin = createSupabaseAdmin();
  const { data: cat } = await admin.from("categorias").select("*").eq("id", params.id).maybeSingle();
  if (!cat) notFound();

  return (
    <div>
      <Link
        href="/admin/categorias"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-dark mb-3"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="font-extrabold text-2xl text-brand-dark mb-5">Editar categoria</h1>
      <CategoriaForm
        modo="editar"
        inicial={{
          id: cat.id,
          nome: cat.nome,
          slug: cat.slug,
          descricao: cat.descricao,
          icone: cat.icone,
          imagem_url: cat.imagem_url,
          ordem: cat.ordem,
          publicada: cat.publicada,
        }}
      />
    </div>
  );
}
