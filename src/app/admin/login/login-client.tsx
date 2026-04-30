"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type Modo = "senha" | "magic";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modo, setModo] = useState<Modo>("senha");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [magicEnviado, setMagicEnviado] = useState(false);

  useEffect(() => {
    const erro = searchParams.get("erro");
    if (erro === "nao_autorizado") {
      toast.error("Você não tem permissão de admin.");
    } else if (erro === "callback") {
      toast.error("Link inválido ou expirado. Tente novamente.");
    }
  }, [searchParams]);

  const entrarComSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) return;
    setEnviando(true);
    try {
      const sb = createSupabaseBrowser();
      const { error } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });
      if (error) {
        toast.error(traduzirErro(error.message));
        return;
      }
      toast.success("Bem-vindo!");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const enviarMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEnviando(true);
    try {
      const sb = createSupabaseBrowser();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${origin}/admin/auth/callback?next=/admin/conta` },
      });
      if (error) {
        toast.error(error.message || "Erro ao enviar link");
        return;
      }
      setMagicEnviado(true);
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-7">
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto rounded-full bg-brand-yellow/20 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-brand-dark" />
          </div>
          <h1 className="font-extrabold text-xl text-brand-dark">Painel Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            {modo === "senha" ? "Entre com email e senha." : "Receba um link de acesso por email."}
          </p>
        </div>

        {modo === "magic" && magicEnviado ? (
          <div className="text-center space-y-3">
            <div className="text-3xl">📨</div>
            <p className="text-sm text-brand-dark font-semibold">Link enviado!</p>
            <p className="text-xs text-gray-500">
              Verifique sua caixa de entrada (e o spam) em <strong>{email}</strong>. Clique no link
              pra entrar e definir uma senha.
            </p>
            <button
              type="button"
              onClick={() => {
                setMagicEnviado(false);
                setModo("senha");
              }}
              className="text-xs text-gray-500 underline"
            >
              Voltar ao login
            </button>
          </div>
        ) : modo === "senha" ? (
          <form onSubmit={entrarComSenha} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-brand-dark flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{ fontSize: 16 }}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-dark flex items-center gap-1.5 mb-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  style={{ fontSize: 16 }}
                  className="w-full h-12 pl-4 pr-11 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={enviando}
              className="w-full h-12 rounded-xl font-extrabold text-sm bg-brand-yellow text-brand-dark disabled:opacity-60 active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Entrar
            </button>
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setModo("magic")}
                className="text-xs text-gray-500 underline hover:text-brand-dark"
              >
                Esqueci a senha / Primeiro acesso
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={enviarMagic} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-brand-dark flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
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
              Enviar link de acesso
            </button>
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setModo("senha")}
                className="text-xs text-gray-500 underline hover:text-brand-dark"
              >
                Voltar ao login com senha
              </button>
            </div>
            <p className="text-[11px] text-gray-400 text-center">
              Você receberá um link por email pra entrar e definir uma nova senha.
            </p>
          </form>
        )}

        <p className="text-[10px] text-gray-400 text-center pt-4 mt-3 border-t border-gray-100">
          Apenas emails cadastrados como admin podem acessar.
        </p>
      </div>
    </div>
  );
}

function traduzirErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou senha incorretos";
  if (m.includes("email not confirmed")) return "Confirme seu email primeiro";
  if (m.includes("user not found")) return "Usuário não encontrado";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde um momento.";
  return msg;
}
