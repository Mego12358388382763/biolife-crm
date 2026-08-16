import { createBrowserClient } from "@supabase/ssr";

// Not typed against types/database.ts's Database interface: that file is a
// hand-authored reference for our own Row shapes, not a full
// supabase-js-compatible schema (Insert/Update/Relationships). Regenerate a
// real Database type with `npm run db:types` once the local instance is
// running if end-to-end query typing is needed.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
