"use client";

import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export function Header() {
  const { totalItens, abrirDrawer } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-brand-yellow">
      <div className="px-4 h-14 flex items-center justify-between max-w-screen-md mx-auto">
        <Link href="/" aria-label="Zé Chegou 24h - Página inicial" className="flex items-center">
          <span className="text-xl text-brand-dark tracking-tight italic font-extrabold">ZÉ CHEGOU 24H</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/produtos"
            className="w-10 h-10 rounded-full flex items-center justify-center active:bg-black/10"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5 text-brand-dark" />
          </Link>
          <button
            type="button"
            onClick={abrirDrawer}
            className="relative w-10 h-10 rounded-full flex items-center justify-center active:bg-black/10"
            aria-label="Carrinho"
          >
            <ShoppingCart className="w-5 h-5 text-brand-dark" />
            {totalItens > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-brand-red text-white text-[11px] font-bold flex items-center justify-center">
                {totalItens > 99 ? "99+" : totalItens}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
