"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { atualizarStatus, type StatusPedido } from "../../actions";

const PROXIMOS: Record<string, { status: StatusPedido; rotulo: string; classe: string }[]> = {
  aguardando_pagamento: [
    { status: "pago", rotulo: "Marcar como pago", classe: "bg-brand-green text-white" },
    { status: "cancelado", rotulo: "Cancelar pedido", classe: "bg-red-100 text-red-700" },
  ],
  pago: [
    { status: "em_separacao", rotulo: "Iniciar separação", classe: "bg-blue-100 text-blue-700" },
    { status: "em_entrega", rotulo: "Saiu pra entrega", classe: "bg-orange-100 text-orange-700" },
    { status: "cancelado", rotulo: "Cancelar pedido", classe: "bg-red-100 text-red-700" },
  ],
  em_separacao: [
    { status: "em_entrega", rotulo: "Saiu pra entrega", classe: "bg-orange-100 text-orange-700" },
    { status: "cancelado", rotulo: "Cancelar pedido", classe: "bg-red-100 text-red-700" },
  ],
  em_entrega: [
    { status: "concluido", rotulo: "Marcar como entregue", classe: "bg-brand-green text-white" },
    { status: "cancelado", rotulo: "Cancelar pedido", classe: "bg-red-100 text-red-700" },
  ],
  concluido: [],
  cancelado: [],
};

export function AcoesStatus({ pedidoId, statusAtual }: { pedidoId: string; statusAtual: string }) {
  const [pending, start] = useTransition();
  const [carregandoStatus, setCarregandoStatus] = useState<StatusPedido | null>(null);
  const router = useRouter();

  const acoes = PROXIMOS[statusAtual] ?? [];
  if (acoes.length === 0) return null;

  const acionar = (s: StatusPedido) => {
    setCarregandoStatus(s);
    start(async () => {
      try {
        await atualizarStatus(pedidoId, s);
        toast.success("Status atualizado!");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao atualizar status");
      } finally {
        setCarregandoStatus(null);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Próximas ações</p>
      <div className="flex flex-wrap gap-2">
        {acoes.map((a) => {
          const carregando = pending && carregandoStatus === a.status;
          const Icon = a.status === "cancelado" ? X : CheckCircle2;
          return (
            <button
              key={a.status}
              type="button"
              onClick={() => acionar(a.status)}
              disabled={pending}
              className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold disabled:opacity-60 active:scale-95 transition-transform ${a.classe}`}
            >
              {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
              {a.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
