"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { salvarWhatsappSuporte } from "./actions";

const formatTelefone = (valor: string) => {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export function ConfiguracoesClient({ whatsappAtual }: { whatsappAtual: string }) {
  const router = useRouter();
  const [salvando, startTransition] = useTransition();
  const [valor, setValor] = useState(formatTelefone(whatsappAtual));

  function salvar() {
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length < 10 || limpo.length > 11) {
      toast.error("Numero deve ter 10 ou 11 digitos (DDD + numero)");
      return;
    }
    startTransition(async () => {
      const r = await salvarWhatsappSuporte(limpo);
      if (!r.ok) {
        toast.error(r.erro || "Erro ao salvar");
        return;
      }
      toast.success("WhatsApp atualizado!");
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 flex items-center justify-center flex-shrink-0">
          <Settings className="w-5 h-5 text-brand-dark" />
        </div>
        <div>
          <h1 className="font-extrabold text-2xl text-brand-dark">Configurações gerais</h1>
          <p className="text-sm text-gray-500">Ajustes globais do site visíveis aos clientes.</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-bold text-brand-dark">WhatsApp do suporte</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Número usado nos botões &ldquo;Falar com suporte&rdquo;, página de pedido e mensagens
              automáticas.
            </p>
          </div>
        </div>

        <label className="text-xs font-bold text-brand-dark mb-1.5 block">
          Número (com DDD)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="tel"
              inputMode="numeric"
              value={valor}
              onChange={(e) => setValor(formatTelefone(e.target.value))}
              placeholder="(11) 99999-9999"
              maxLength={15}
              style={{ fontSize: 16 }}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="h-12 px-5 rounded-xl font-bold text-sm bg-brand-yellow text-brand-dark active:scale-[0.98] disabled:opacity-60 inline-flex items-center gap-2"
          >
            {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Cache do servidor é de 60s — pode demorar até 1 minuto pra refletir no site.
        </p>
      </section>
    </div>
  );
}
