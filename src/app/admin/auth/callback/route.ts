import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// Recebe o code do magic link, troca por sessao e redireciona pro /admin
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";

  if (code) {
    const sb = createSupabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${url.origin}${next}`);
    }
  }

  return NextResponse.redirect(`${url.origin}/admin/login?erro=callback`);
}
