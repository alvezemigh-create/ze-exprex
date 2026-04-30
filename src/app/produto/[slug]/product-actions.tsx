"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { Produto } from "@/lib/types";
import { fmtPreco, precoFinal } from "@/lib/utils";

export function ProductActions({ produto }: { produto: Produto }) {
  const { adicionar } = useCart();
  const [qtd, setQtd] = useState(1);
  const preco = precoFinal(produto.price, produto.promoPrice);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
        <button
          type="button"
          onClick={() => setQtd((q) => Math.max(1, q - 1))}
          className="w-10 h-10 flex items-center justify-center active:bg-gray-50"
          aria-label="Diminuir"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-semibold text-sm">{qtd}</span>
        <button
          type="button"
          onClick={() => setQtd((q) => q + 1)}
          className="w-10 h-10 flex items-center justify-center active:bg-gray-50"
          aria-label="Aumentar"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => adicionar(produto, qtd)}
        className="flex-1 h-11 rounded-full font-bold text-sm flex items-center justify-center gap-2 text-brand-dark active:scale-[0.98] transition-transform bg-brand-yellow"
      >
        <ShoppingCart className="w-4 h-4" />
        Adicionar · {fmtPreco(preco * qtd)}
      </button>
    </div>
  );
}
