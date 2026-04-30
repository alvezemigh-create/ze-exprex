"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, EyeOff, ImageIcon, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { reordenarCategorias } from "./actions";

type CatRow = {
  id: string;
  nome: string;
  slug: string;
  icone: string | null;
  imagem_url: string | null;
  ordem: number;
  publicada: boolean;
  totalProdutos: number;
};

export function CategoriasReorderClient({ categorias }: { categorias: CatRow[] }) {
  const [lista, setLista] = useState(categorias);
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
    const ordens = lista.map((c, i) => ({ id: c.id, ordem: (i + 1) * 10 }));
    startTransition(async () => {
      const r = await reordenarCategorias(ordens);
      if (!r.ok) {
        toast.error(r.erro);
        return;
      }
      toast.success("Ordem salva!");
      setAlterado(false);
    });
  };

  if (lista.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center text-sm text-gray-500 shadow-sm">
        Nenhuma categoria ainda. Crie a primeira pelo botão acima.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alterado && (
        <div className="sticky top-2 z-10 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm">
          <span className="text-xs font-semibold text-yellow-700">Ordem alterada — salve pra refletir no site</span>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold bg-brand-yellow text-brand-dark active:scale-95"
          >
            {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Salvar ordem
          </button>
        </div>
      )}

      <ul className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        {lista.map((c, idx) => (
          <li key={c.id} className="flex items-center gap-3 px-3 py-2.5">
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

            <div className="w-12 h-12 rounded-lg bg-gray-100 relative flex-shrink-0 overflow-hidden flex items-center justify-center">
              {c.imagem_url ? (
                <Image src={c.imagem_url} alt={c.nome} fill sizes="48px" className="object-contain p-1" />
              ) : (
                <ImageIcon className="w-4 h-4 text-gray-300" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link href={`/admin/categorias/${c.id}`} className="font-bold text-sm text-brand-dark hover:underline truncate">
                  {c.nome}
                </Link>
                {!c.publicada && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    <EyeOff className="w-2.5 h-2.5" /> oculta
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                /{c.slug} · {c.totalProdutos} produto{c.totalProdutos === 1 ? "" : "s"}
              </p>
            </div>

            <Link
              href={`/admin/categorias/${c.id}`}
              className="text-xs font-bold text-brand-dark hover:underline"
            >
              Editar
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
