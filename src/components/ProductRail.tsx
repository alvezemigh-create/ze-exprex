import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Produto } from "@/lib/types";

export function ProductRail({
  titulo,
  produtos,
  verMaisHref,
  corBarra = "bg-brand-orange",
  prioridadeAteIndex = -1,
}: {
  titulo: string;
  produtos: Produto[];
  verMaisHref: string;
  corBarra?: string;
  prioridadeAteIndex?: number;
}) {
  if (!produtos.length) return null;
  return (
    <section className="py-5 bg-white">
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-5 rounded-full ${corBarra}`} />
          <h2 className="font-bold text-lg text-brand-dark">{titulo}</h2>
        </div>
        <Link href={verMaisHref} className="text-sm font-semibold text-gray-500 flex items-center gap-0.5">
          Ver mais <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2 px-4 -mx-4">
        {produtos.map((p, i) => (
          <div key={p.id} className="flex-shrink-0 w-[130px]">
            <ProductCard produto={p} prioridade={i <= prioridadeAteIndex} />
          </div>
        ))}
      </div>
    </section>
  );
}
