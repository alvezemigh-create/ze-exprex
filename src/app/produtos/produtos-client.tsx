"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, X } from "lucide-react";
import type { Categoria, Produto } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { precoFinal } from "@/lib/utils";

const PAGE_SIZE = 60;

export function ProdutosClient({ produtos, categorias }: { produtos: Produto[]; categorias: Categoria[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const categoria = params.get("category") ?? "";
  const buscaUrl = params.get("search") ?? "";
  const ordem = params.get("sort") ?? "";

  const [busca, setBusca] = useState(buscaUrl);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setBusca(buscaUrl);
  }, [buscaUrl]);

  useEffect(() => {
    setPagina(1);
  }, [categoria, buscaUrl, ordem]);

  const setParam = (chave: string, valor: string) => {
    const novo = new URLSearchParams(params.toString());
    if (valor) novo.set(chave, valor);
    else novo.delete(chave);
    router.replace(`/produtos${novo.toString() ? "?" + novo.toString() : ""}`, { scroll: false });
  };

  const filtrados = useMemo(() => {
    let lista = produtos.slice();
    if (categoria) lista = lista.filter((p) => p.category?.slug === categoria);
    if (buscaUrl) {
      const q = buscaUrl.toLowerCase();
      lista = lista.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q),
      );
    }
    switch (ordem) {
      case "name":
        lista.sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR"));
        break;
      case "price-asc":
        lista.sort((a, b) => precoFinal(a.price, a.promoPrice) - precoFinal(b.price, b.promoPrice));
        break;
      case "price-desc":
        lista.sort((a, b) => precoFinal(b.price, b.promoPrice) - precoFinal(a.price, a.promoPrice));
        break;
      case "best":
        lista.sort(
          (a, b) =>
            (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        );
        break;
      default:
        lista.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    return lista;
  }, [produtos, categoria, buscaUrl, ordem]);

  const total = filtrados.length;
  const visiveis = filtrados.slice(0, pagina * PAGE_SIZE);
  const restantes = total - visiveis.length;

  const catAtiva = categorias.find((c) => c.slug === categoria);
  const titulo = catAtiva ? catAtiva.name : buscaUrl ? `Resultados: ${buscaUrl}` : "Todos os Produtos";

  const submeterBusca = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("search", busca.trim());
  };

  const limparTudo = () => {
    setBusca("");
    router.replace("/produtos", { scroll: false });
  };

  const algumFiltro = !!(categoria || buscaUrl || ordem);

  return (
    <div className="px-4 pt-3 pb-6">
      <Link className="inline-flex items-center gap-1.5 text-sm text-gray-500 active:text-brand-dark mb-3" href="/">
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </Link>

      <div className="mb-3 rounded-xl px-3 py-2 flex items-center gap-2 bg-yellow-50 border border-yellow-300">
        <span className="text-base leading-none">💰</span>
        <p className="text-[12px] leading-tight text-brand-dark">
          <span className="font-bold">Os menores preços da região.</span>
          <span className="text-gray-600"> Compare e economize.</span>
        </p>
      </div>

      <h1 className="font-extrabold text-xl text-brand-dark tracking-tight mb-0.5 font-display">{titulo}</h1>
      <p className="text-xs text-gray-500 mb-3">
        {total} produto{total === 1 ? "" : "s"}
      </p>

      <form onSubmit={submeterBusca} className="relative mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Buscar bebidas, marcas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-11 pl-9 pr-9 rounded-full border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            style={{ fontSize: 16 }}
          />
        </div>
        <button
          type="submit"
          className="h-11 px-4 rounded-full font-semibold text-sm text-brand-dark active:scale-95 transition-transform bg-brand-yellow"
        >
          Buscar
        </button>
      </form>

      <select
        value={ordem}
        onChange={(e) => setParam("sort", e.target.value)}
        className="w-full h-11 px-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow mb-3"
        style={{ fontSize: 16 }}
      >
        <option value="">Ordenar por</option>
        <option value="name">Nome A-Z</option>
        <option value="price-asc">Menor Preço</option>
        <option value="price-desc">Maior Preço</option>
        <option value="best">Mais Vendidos</option>
      </select>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3 -mx-4 px-4">
        <button
          type="button"
          onClick={() => setParam("category", "")}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !categoria ? "bg-brand-yellow text-brand-dark font-bold" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          Todos
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setParam("category", c.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categoria === c.slug
                ? "bg-brand-yellow text-brand-dark font-bold"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {algumFiltro && (
        <button
          type="button"
          onClick={limparTudo}
          className="inline-flex items-center gap-1 text-xs text-gray-500 active:text-brand-dark mb-3"
        >
          <X className="w-3 h-3" /> Limpar filtros
        </button>
      )}

      {visiveis.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">Nenhum produto encontrado.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {visiveis.map((p) => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      )}

      {restantes > 0 && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setPagina((n) => n + 1)}
            className="h-11 px-6 rounded-full font-semibold text-sm text-brand-dark active:scale-95 transition-transform bg-brand-yellow"
          >
            Carregar mais ({restantes} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
