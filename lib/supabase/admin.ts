import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin-privileged client using the service_role key. This key bypasses RLS
// entirely, so this client must NEVER be exposed to the browser and must
// only be constructed inside code paths already gated by requireAdmin().
// SUPABASE_SERVICE_ROLE_KEY is deliberately NOT prefixed with NEXT_PUBLIC_,
// so Next.js never bundles it into client-side JavaScript.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Set it as a server-only environment variable to enable user management.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
