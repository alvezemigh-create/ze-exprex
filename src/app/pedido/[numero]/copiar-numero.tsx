"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopiarNumero({ numero }: { numero: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(numero);
          toast.success("Número copiado!");
        } catch {
          toast.error("Erro ao copiar");
        }
      }}
      aria-label="Copiar número do pedido"
      className="ml-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center active:scale-95"
    >
      <Copy className="w-3 h-3 text-gray-500" />
    </button>
  );
}
