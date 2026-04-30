"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { fmtPreco } from "@/lib/utils";
import { reordenarProdutos } from "./actions";

type Row = {
  id: string;
  nome: string;
  slug: string;
  imagem_url: string | null;
  preco: number | string | null;
  preco_promocional: number | string | null;
  ordem: number;
  em_estoque: boolean;
  publicado: boolean;
};

export function ProdutosReorderClient({ produtos }: { produtos: Row[] }) {
  const [lista, setLista] = useState(produtos);
  const [alterado, setAlterado] = useState(false);
  const [salvando, startTransition] = useTransition();

  const mover = (idx: number, dir: -1 | 1) => {
    const novo = idx + dir;
    if (novo < 0 || novo >= lista.length) return;
    const next = [...lista];
    [next[idx], next[novo]] = [next[novo], next[idx]];
    setLista(next);
    setAlterado(true);
  };

  const salvar = () => {
    const ordens = lista.map((p, i) => ({ id: p.id, ordem: (i + 1) * 10 }));
    startTransition(async () => {
      const r = await reordenarProdutos(ordens);
      if (!r.ok) {
        toast.error(r.erro);
        return;
      }
      toast.success("Ordem salva!");
      setAlterado(false);
    });
  };

  if (lista.length === 0) {
    return <div className="bg-white rounded-2xl p-10 text-center text-sm text-gray-500 shadow-sm">Nenhum produto.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-2 z-10 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm">
        <span className="text-xs font-semibold text-yellow-700">
          {alterado ? "Ordem alterada — salve pra refletir no site" : "Use as setas pra reordenar."}
        </span>
        <button
          type="button"
          onClick={salvar}
          disabled={salvando || !alterado}
          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold bg-brand-yellow text-brand-dark active:scale-95 disabled:opacity-50"
        >
          {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Salvar ordem
        </button>
      </div>

      <ul className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        {lista.map((p, idx) => (
          <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => mover(idx, -1)}
                disabled={idx === 0}
                className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => mover(idx, 1)}
                disabled={idx === lista.length - 1}
                className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-10 h-10 rounded-lg bg-gray-100 relative flex-shrink-0 overflow-hidden flex items-center justify-center">
              {p.imagem_url ? (
                <Image src={p.imagem_url} alt="" fill sizes="40px" className="object-contain p-0.5" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-dark truncate">{p.nome}</p>
              <p className="text-[11px] text-gray-400 truncate">/{p.slug}</p>
            </div>

            <p className="text-sm font-bold text-brand-dark">
              {p.preco_promocional != null
                ? fmtPreco(Number(p.preco_promocional))
                : p.preco != null
                ? fmtPreco(Number(p.preco))
                : "—"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
