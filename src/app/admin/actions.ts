"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function logout() {
  const sb = createSupabaseServer();
  await sb.auth.signOut();
  redirect("/admin/login");
}

export type StatusPedido =
  | "aguardando_pagamento"
  | "pago"
  | "em_separacao"
  | "em_entrega"
  | "concluido"
  | "cancelado";

async function ensureAdmin() {
  const sb = createSupabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error("Não autenticado");

  const admin = createSupabaseAdmin();
  const { data: ehAdmin } = await admin
    .from("app_admins")
    .select("email")
    .ilike("email", data.user.email!)
    .maybeSingle();

  if (!ehAdmin) throw new Error("Não autorizado");
  return { user: data.user, admin };
}

export async function atualizarStatus(pedidoId: string, status: StatusPedido) {
  const { admin } = await ensureAdmin();

  const patch: Record<string, unknown> = { status };
  if (status === "pago") patch.paid_at = new Date().toISOString();

  const { error } = await admin.from("pedidos").update(patch).eq("id", pedidoId);
  if (error) throw new Error(error.message);
}
