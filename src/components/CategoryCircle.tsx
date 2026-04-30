"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Beer,
  Cake,
  Cigarette,
  CupSoda,
  Droplets,
  Flame,
  GlassWater,
  Martini,
  ShoppingBag,
  Tag,
  Wine,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Categoria } from "@/lib/types";

const ICONES: Record<string, LucideIcon> = {
  beer: Beer,
  cake: Cake,
  cigarette: Cigarette,
  "cup-soda": CupSoda,
  droplets: Droplets,
  flame: Flame,
  martini: Martini,
  "shopping-bag": ShoppingBag,
  tag: Tag,
  wine: Wine,
  zap: Zap,
};

export function CategoryCircle({ categoria }: { categoria: Categoria }) {
  const [erro, setErro] = useState(false);
  const Ico = (categoria.icon && ICONES[categoria.icon]) || GlassWater;
  const mostrarImg = categoria.imageUrl && !erro;

  return (
    <Link
      href={`/produtos?category=${encodeURIComponent(categoria.slug)}`}
      className="flex-shrink-0 w-20 flex flex-col items-center gap-1.5"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-gray relative ring-1 ring-gray-100 flex items-center justify-center">
        {mostrarImg ? (
          <Image
            src={categoria.imageUrl!}
            alt={categoria.name}
            fill
            sizes="64px"
            className="object-cover"
            onError={() => setErro(true)}
          />
        ) : (
          <Ico className="w-7 h-7 text-brand-dark/70" />
        )}
      </div>
      <span className="text-[11px] text-center text-brand-dark leading-tight font-medium line-clamp-2">
        {categoria.name}
      </span>
    </Link>
  );
}
