import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { listarCategoriasPublicadas, listarProdutos } from "@/lib/data";
import { ProdutosClient } from "./produtos-client";

export const revalidate = 300;

export default async function ProdutosPage() {
  const [produtos, categorias] = await Promise.all([
    listarProdutos(),
    listarCategoriasPublicadas(),
  ]);
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="px-4 py-12 text-center text-gray-400 text-sm">Carregando...</div>}>
          <ProdutosClient produtos={produtos} categorias={categorias} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
