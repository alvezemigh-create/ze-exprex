"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function ContaClient({ email }: { email: string }) {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 8) {
      toast.error("Senha precisa ter pelo menos 8 caracteres");
      return;
    }
    if (novaSenha !== confirmar) {
      toast.error("As senhas não conferem");
      return;
    }
    setEnviando(true);
    try {
      const sb = createSupabaseBrowser();
      const { error } = await sb.auth.updateUser({ password: novaSenha });
      if (error) {
        toast.error(error.message || "Erro ao atualizar senha");
        return;
      }
      toast.success("Senha atualizada!");
      setNovaSenha("");
      setConfirmar("");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-extrabold text-2xl text-brand-dark mb-1">Minha conta</h1>
      <p className="text-sm text-gray-500 mb-5">Configurações de acesso ao painel.</p>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 inline-flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Email
        </h2>
        <p className="text-sm text-brand-dark font-semibold">{email}</p>
        <p className="text-[11px] text-gray-400 mt-1">
          Pra trocar o email cadastrado, fale com o desenvolvedor.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 inline-flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5" /> Senha
        </h2>
        <form onSubmit={salvar} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-brand-dark mb-1 block">Nova senha</label>
            <div className="relative">
              <input
                type={mostrar ? "text" : "password"}
                required
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                style={{ fontSize: 16 }}
                className="w-full h-12 pl-4 pr-11 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setMostrar((v) => !v)}
                aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-brand-dark mb-1 block">Confirmar nova senha</label>
            <input
              type={mostrar ? "text" : "password"}
              required
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repita a senha"
              style={{ fontSize: 16 }}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="w-full h-12 rounded-xl font-extrabold text-sm bg-brand-yellow text-brand-dark disabled:opacity-60 active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Salvar nova senha
          </button>
        </form>
      </div>
    </div>
  );
}
