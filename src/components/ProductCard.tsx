"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { Produto } from "@/lib/types";
import { calcDesconto, fmtPreco, precoFinal } from "@/lib/utils";
import { imagemProduto } from "@/lib/imagens";

export function ProductCard({ produto, prioridade = false }: { produto: Produto; prioridade?: boolean }) {
  const { adicionar } = useCart();
  const desconto = calcDesconto(produto.price, produto.promoPrice);
  const preco = precoFinal(produto.price, produto.promoPrice);
  const img = imagemProduto(produto);

  return (
    <div className="relative h-full">
      <Link href={`/produto/${produto.slug}`} className="block h-full">
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 h-full flex flex-col">
          <div className="relative aspect-square bg-gray-50">
            <Image
              src={img}
              alt={produto.name}
              fill
              sizes="(max-width: 640px) 50vw, 220px"
              className="object-contain p-2"
              priority={prioridade}
              loading={prioridade ? undefined : "lazy"}
            />
            {desconto > 0 && (
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-white text-xs font-bold bg-brand-green">
                -{desconto}%
              </span>
            )}
            {produto.bestSeller && (
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold leading-none uppercase tracking-wide bg-brand-yellow text-brand-dark">
                Menor preço
              </span>
            )}
          </div>
          <div className="px-2.5 pb-2.5 pt-1.5 flex flex-col flex-1">
            <h3 className="text-[13px] font-medium text-[#333] leading-tight line-clamp-3 min-h-[3.2em]">
              {produto.name}
            </h3>
            <div className="mt-auto pt-1 flex items-end justify-between">
              <div>
                {produto.price && produto.promoPrice && produto.price > produto.promoPrice && (
                  <p className="text-xs text-brand-red line-through">{fmtPreco(produto.price)}</p>
                )}
                <p className="text-base font-bold text-brand-green">{fmtPreco(preco)}</p>
              </div>
              <div className="w-10 h-10 flex-shrink-0" />
            </div>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          adicionar(produto);
        }}
        className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-20 bg-brand-green active:scale-95 transition-transform shadow-sm"
        aria-label={`Adicionar ${produto.name} ao carrinho`}
      >
        <Plus className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
