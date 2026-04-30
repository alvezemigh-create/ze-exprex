import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente "admin" (service role) — bypassa RLS.
// Usar APENAS em Server Actions / Route Handlers / scripts servidor.
// NUNCA importar a partir de Client Components.
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
