"use client";

import { useEffect, useState } from "react";
import { Copy, CheckCircle2, MessageCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { linkWhatsApp } from "@/lib/utils";

type Props = {
  numero: string;
  qrCode: string | null;
  qrImage: string | null;
  receiptUrl?: string | null;
  initialStatus: string;
  whatsappSuporte: string;
};

export function PixPagamento({ numero, qrCode, qrImage, receiptUrl, initialStatus, whatsappSuporte }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [verificando, setVerificando] = useState(false);

  const pago = status === "pago" || status === "concluido";

  async function verificar() {
    setVerificando(true);
    try {
      const r = await fetch(`/api/pagamento/status/${encodeURIComponent(numero)}`, { cache: "no-store" });
      const j = (await r.json()) as { status?: string };
      if (j.status) setStatus(j.status);
      if (j.status === "pago") toast.success("Pagamento confirmado!");
    } catch {
      toast.error("Erro ao verificar pagamento");
    } finally {
      setVerificando(false);
    }
  }

  // polling automatico a cada 8s enquanto nao pagou
  useEffect(() => {
    if (pago) return;
    const t = setInterval(() => {
      void verificar();
    }, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pago, numero]);

  if (pago) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-brand-dark">Pagamento confirmado</p>
            <p className="text-xs text-gray-500">Já estamos preparando seu pedido.</p>
          </div>
        </div>
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-center w-full h-11 rounded-xl border border-gray-200 text-sm font-semibold text-brand-dark flex items-center justify-center"
          >
            Ver comprovante
          </a>
        )}
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 text-center">
        <p className="text-sm text-gray-500">PIX não disponível. Entre em contato pelo WhatsApp.</p>
      </div>
    );
  }

  async function copiar() {
    if (!qrCode) return;
    try {
      await navigator.clipboard.writeText(qrCode);
      toast.success("Código PIX copiado!");
    } catch {
      toast.error("Erro ao copiar");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
      <h3 className="text-base font-bold text-brand-dark mb-1">Pague com PIX</h3>
      <p className="text-xs text-gray-500 mb-4">
        Escaneie o QR Code ou copie o código abaixo. Assim que pagar, seu pedido entra em separação.
      </p>

      {qrImage && (
        <div className="mx-auto w-56 h-56 bg-white border border-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImage}
            alt="QR Code PIX"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
        <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">PIX copia e cola</p>
        <p className="text-xs text-gray-700 break-all leading-snug font-mono">{qrCode}</p>
      </div>

      <button
        type="button"
        onClick={copiar}
        className="w-full h-12 rounded-xl bg-brand-yellow text-brand-dark font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <Copy className="w-4 h-4" /> Copiar código PIX
      </button>

      <button
        type="button"
        onClick={() => void verificar()}
        disabled={verificando}
        className="w-full h-11 mt-2 rounded-xl border border-gray-200 text-sm font-semibold text-brand-dark flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
      >
        <RefreshCcw className={`w-4 h-4 ${verificando ? "animate-spin" : ""}`} />
        {verificando ? "Verificando..." : "Já paguei, verificar"}
      </button>

      <p className="text-[11px] text-gray-400 text-center mt-3">
        Verificamos automaticamente a cada poucos segundos.
      </p>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <a
          href={linkWhatsApp(
            whatsappSuporte,
            `Olá! Tive um problema com o pagamento do pedido ${numero}. Pode me ajudar?`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-12 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-[13px] flex items-center justify-center gap-2 px-4 py-2.5 active:scale-[0.98] transition shadow-sm"
        >
          <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" />
          <span className="leading-tight text-center">
            Problemas com o PIX? Falar com o suporte
          </span>
        </a>
        <p className="text-[11px] text-gray-400 text-center mt-2">
          Atendimento 24h via WhatsApp
        </p>
      </div>
    </div>
  );
}
