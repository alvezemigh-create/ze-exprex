import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoriaForm } from "../categoria-form";

export const metadata = { title: "Admin · Nova categoria — Zé Chegou 24h", robots: { index: false } };

export default function NovaCategoriaPage() {
  return (
    <div>
      <Link
        href="/admin/categorias"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-dark mb-3"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="font-extrabold text-2xl text-brand-dark mb-5">Nova categoria</h1>
      <CategoriaForm
        modo="novo"
        inicial={{
          nome: "",
          slug: "",
          descricao: "",
          icone: "",
          imagem_url: "",
          ordem: 0,
          publicada: true,
        }}
      />
    </div>
  );
}
