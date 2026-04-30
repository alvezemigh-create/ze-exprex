import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ContaClient } from "./conta-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Minha conta — Zé Chegou 24h", robots: { index: false } };

export default async function ContaPage() {
  const sb = createSupabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/admin/login");

  return <ContaClient email={data.user.email ?? ""} />;
}
