"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { definirWhatsappSuporte, obterWhatsappSuporte } from "@/lib/config-app";

export async function lerWhatsappSuporte(): Promise<string> {
  return obterWhatsappSuporte();
}

export async function salvarWhatsappSuporte(
  numero: string,
): Promise<{ ok: true; numero: string } | { ok: false; erro: string }> {
  const sb = createSupabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) return { ok: false, erro: "Nao autenticado" };

  try {
    await definirWhatsappSuporte(numero, userData.user.email ?? undefined);
    revalidatePath("/admin/configuracoes");
    revalidatePath("/pedido", "layout");
    return { ok: true, numero: numero.replace(/\D/g, "") };
  } catch (e) {
    const erro = e instanceof Error ? e.message : "Erro ao salvar";
    return { ok: false, erro };
  }
}
