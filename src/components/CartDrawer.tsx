"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { fmtPreco } from "@/lib/utils";

export function CartDrawer() {
  const {
    itens,
    totalItens,
    totalValor,
    alterarQtd,
    remover,
    drawerAberto,
    fecharDrawer,
  } = useCart();

  useEffect(() => {
    if (drawerAberto) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [drawerAberto]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") fecharDrawer();
    }
    if (drawerAberto) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [drawerAberto, fecharDrawer]);

  return (
    <>
      <div
        aria-hidden={!drawerAberto}
        onClick={fecharDrawer}
        className={`fixed inset-0 z-[10000] bg-black/50 transition-opacity duration-200 ${
          drawerAberto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho"
        aria-hidden={!drawerAberto}
        className={`fixed bottom-0 left-0 right-0 z-[10001] bg-white rounded-t-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out will-change-transform ${
          drawerAberto ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh" }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
          <h2 className="font-bold text-lg text-brand-dark">Carrinho ({totalItens})</h2>
          <button
            type="button"
            onClick={fecharDrawer}
            aria-label="Fechar carrinho"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            <X className="w-4 h-4 text-brand-dark" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-sm">Seu carrinho está vazio</p>
              <p className="text-xs text-gray-400 mt-1">Adicione bebidas para começar!</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {itens.map((item) => (
                <li key={item.produtoId} className="flex gap-3 p-2.5 rounded-xl bg-gray-50">
                  <div className="relative w-14 h-14 rounded-lg bg-white flex-shrink-0 overflow-hidden">
                    {item.imagem && (
                      <Image
                        src={item.imagem}
                        alt={item.nome}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-brand-dark line-clamp-1">{item.nome}</h4>
                    <p className="text-sm font-bold text-brand-dark mt-0.5">
                      {fmtPreco(item.precoUnitario)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => alterarQtd(item.produtoId, -1)}
                        aria-label="Diminuir quantidade"
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center active:bg-gray-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => alterarQtd(item.produtoId, 1)}
                        aria-label="Aumentar quantidade"
                        className="w-6 h-6 rounded-full bg-brand-yellow flex items-center justify-center active:opacity-80"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remover(item.produtoId)}
                        aria-label="Remover item"
                        className="ml-auto w-6 h-6 rounded-full bg-red-50 flex items-center justify-center active:bg-red-100"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {itens.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 pb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-bold text-brand-dark">{fmtPreco(totalValor)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={fecharDrawer}
              className="flex items-center justify-center w-full h-12 rounded-full text-brand-dark font-bold text-sm active:scale-[0.98] transition-transform bg-brand-yellow"
            >
              Finalizar Pedido
            </Link>
            <button
              type="button"
              onClick={fecharDrawer}
              className="flex items-center justify-center w-full h-10 rounded-full border-2 border-gray-200 text-gray-600 font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
