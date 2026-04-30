"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategorySquare } from "./CategorySquare";
import type { Categoria } from "@/lib/types";

export function CategoriesRow({ categorias }: { categorias: Categoria[] }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = ref.current;
    if (!el) return;
    const delta = el.clientWidth * 0.7 * (dir === "right" ? 1 : -1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="relative border-b border-gray-100">
      <div className="px-4 py-4">
        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
          {categorias.map((c) => (
            <CategorySquare key={c.id} categoria={c} />
          ))}
        </div>
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow items-center justify-center z-10 hover:bg-gray-50 active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4 text-brand-dark" />
        </button>
        <button
          type="button"
          aria-label="Próximo"
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow items-center justify-center z-10 hover:bg-gray-50 active:scale-95 transition"
        >
          <ChevronRight className="w-4 h-4 text-brand-dark" />
        </button>
      </div>
    </section>
  );
}
