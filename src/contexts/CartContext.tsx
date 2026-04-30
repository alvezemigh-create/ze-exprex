"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ItemCarrinho, Produto } from "@/lib/types";
import { precoFinal } from "@/lib/utils";
import { imagemProduto } from "@/lib/imagens";

const CHAVE_STORAGE = "ze:carrinho:v1";

type CarrinhoCtx = {
  itens: ItemCarrinho[];
  totalItens: number;
  totalValor: number;
  adicionar: (produto: Produto, quantidade?: number) => void;
  remover: (produtoId: string) => void;
  alterarQtd: (produtoId: string, delta: number) => void;
  definirQtd: (produtoId: string, qtd: number) => void;
  limpar: () => void;
  pronto: boolean;
  drawerAberto: boolean;
  abrirDrawer: () => void;
  fecharDrawer: () => void;
};

const Ctx = createContext<CarrinhoCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [pronto, setPronto] = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAVE_STORAGE);
      if (raw) setItens(JSON.parse(raw));
    } catch {}
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
    } catch {}
  }, [itens, pronto]);

  const adicionar = (produto: Produto, quantidade = 1) => {
    setItens((prev) => {
      const idx = prev.findIndex((i) => i.produtoId === produto.id);
      if (idx >= 0) {
        const novo = prev.slice();
        novo[idx] = { ...novo[idx], quantidade: novo[idx].quantidade + quantidade };
        return novo;
      }
      return [
        ...prev,
        {
          produtoId: produto.id,
          slug: produto.slug,
          nome: produto.name,
          imagem: imagemProduto(produto),
          precoUnitario: precoFinal(produto.price, produto.promoPrice),
          quantidade,
        },
      ];
    });
    toast.success(`${produto.name.trim()} adicionado ao carrinho`);
    setDrawerAberto(true);
  };

  const abrirDrawer = () => setDrawerAberto(true);
  const fecharDrawer = () => setDrawerAberto(false);

  const remover = (produtoId: string) => setItens((prev) => prev.filter((i) => i.produtoId !== produtoId));

  const alterarQtd = (produtoId: string, delta: number) =>
    setItens((prev) =>
      prev
        .map((i) => (i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0),
    );

  const definirQtd = (produtoId: string, qtd: number) =>
    setItens((prev) =>
      prev
        .map((i) => (i.produtoId === produtoId ? { ...i, quantidade: qtd } : i))
        .filter((i) => i.quantidade > 0),
    );

  const limpar = () => setItens([]);

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const totalValor = itens.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0);

  const valor = useMemo(
    () => ({
      itens,
      totalItens,
      totalValor,
      adicionar,
      remover,
      alterarQtd,
      definirQtd,
      limpar,
      pronto,
      drawerAberto,
      abrirDrawer,
      fecharDrawer,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itens, totalItens, totalValor, pronto, drawerAberto],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return c;
}
