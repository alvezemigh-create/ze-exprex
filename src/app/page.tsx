import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCircle } from "@/components/CategoryCircle";
import { HeroBanner } from "@/components/HeroBanner";
import { listarCategoriasPublicadas, listarProdutos } from "@/lib/data";

export const revalidate = 300;

export default async function Home() {
  const [categorias, todosProdutos] = await Promise.all([
    listarCategoriasPublicadas(),
    listarProdutos(),
  ]);

  const produtosPorCategoria = categorias
    .map((c) => ({
      cat: c,
      produtos: todosProdutos
        .filter((p) => p.category?.slug === c.slug)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .slice(0, 10),
    }))
    .filter((s) => s.produtos.length > 0);

  return (
    <>
      <Header />
      <main className="flex-1 pb-24">
        <HeroBanner />

        <section className="pt-2 pb-4">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-base text-brand-dark font-display">Categorias</h2>
            <Link href="/produtos" className="inline-flex items-center text-xs text-gray-500 active:text-brand-dark">
              Ver tudo <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none px-4">
            {categorias.map((c) => (
              <CategoryCircle key={c.id} categoria={c} />
            ))}
          </div>
        </section>

        {produtosPorCategoria.map(({ cat, produtos }, idx) => (
          <section key={cat.id} className={idx % 2 === 0 ? "py-4 bg-white" : "py-4 bg-brand-gray"}>
            <div className="px-4 flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-base text-brand-dark font-display">{cat.name}</h2>
              <Link
                href={`/produtos?category=${encodeURIComponent(cat.slug)}`}
                className="inline-flex items-center text-xs text-gray-500 active:text-brand-dark"
              >
                Ver tudo <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 px-4">
              {produtos.map((p, i) => (
                <div key={p.id} className="flex-shrink-0 w-[155px]">
                  <ProductCard produto={p} prioridade={idx === 0 && i < 4} />
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="px-4 py-5">
          <div className="rounded-2xl bg-brand-dark p-5 text-center">
            <p className="text-2xl mb-1">🚀</p>
            <h3 className="font-bold text-white text-base mb-1">Entrega em até 15 min</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Distribuidoras parceiras na sua região — bebida gelada na sua porta sem demora.
            </p>
            <Link
              href="/produtos"
              className="inline-flex h-11 px-6 rounded-full font-bold text-sm bg-brand-yellow text-brand-dark active:scale-95 transition-transform items-center"
            >
              Ver todos os produtos
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
