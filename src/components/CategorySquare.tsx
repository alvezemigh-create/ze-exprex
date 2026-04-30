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

export function CategorySquare({ categoria }: { categoria: Categoria }) {
  const [erro, setErro] = useState(false);
  const Ico = (categoria.icon && ICONES[categoria.icon]) || GlassWater;
  const mostrarImg = categoria.imageUrl && !erro;

  return (
    <Link
      href={`/produtos?category=${encodeURIComponent(categoria.slug)}`}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
    >
      <div className="w-[60px] h-[60px] rounded-xl overflow-hidden bg-gray-50 relative flex items-center justify-center">
        {mostrarImg ? (
          <Image
            src={categoria.imageUrl!}
            alt={categoria.name}
            fill
            sizes="60px"
            className="object-cover"
            onError={() => setErro(true)}
          />
        ) : (
          <Ico className="w-7 h-7 text-brand-dark/60" />
        )}
      </div>
      <span className="text-xs font-medium text-center text-gray-600 max-w-[70px] truncate">
        {categoria.name}
      </span>
    </Link>
  );
}
