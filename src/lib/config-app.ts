import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

const CHAVE_WHATSAPP = "whatsapp_suporte";
const PADRAO_WHATSAPP = "11999999999";

let cacheWhats: { valor: string; expira: number } | null = null;

/**
 * Le o numero de WhatsApp do suporte (configurado via /admin/configuracoes).
 * Cache de 60s pra evitar bater no banco em toda renderizacao.
 */
export async function obterWhatsappSuporte(): Promise<string> {
  const agora = Date.now();
  if (cacheWhats && cacheWhats.expira > agora) return cacheWhats.valor;
  try {
    const sb = createSupabaseAdmin();
    const { data } = await sb
      .from("app_config")
      .select("valor")
      .eq("chave", CHAVE_WHATSAPP)
      .maybeSingle();
    const v = data?.valor;
    const numero = typeof v === "string" ? v.replace(/\D/g, "") : PADRAO_WHATSAPP;
    const valor = numero || PADRAO_WHATSAPP;
    cacheWhats = { valor, expira: agora + 60_000 };
    return valor;
  } catch (e) {
    console.error("[config-app] falha ler whatsapp", e);
    return PADRAO_WHATSAPP;
  }
}

export async function definirWhatsappSuporte(numero: string, atualizadoPor?: string) {
  const limpo = numero.replace(/\D/g, "");
  if (limpo.length < 10 || limpo.length > 13) {
    throw new Error("Numero invalido — informe DDI+DDD+numero (10 a 13 digitos).");
  }
  const sb = createSupabaseAdmin();
  const { error } = await sb
    .from("app_config")
    .upsert(
      { chave: CHAVE_WHATSAPP, valor: limpo, atualizado_por: atualizadoPor ?? null },
      { onConflict: "chave" },
    );
  if (error) throw new Error(`Falha ao salvar whatsapp: ${error.message}`);
  cacheWhats = null;
}
