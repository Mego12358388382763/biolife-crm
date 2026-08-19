import "server-only";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

// Calls the reset_crm_data() Postgres function (see
// supabase/migrations/20260101000003_reset_crm_data.sql). Authorization is
// enforced inside that function via is_admin() — this call fails for any
// non-admin regardless of what the client sends, independent of the
// requireAdmin() check the calling Server Action also performs.
export async function resetCrmData() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_crm_data");
  if (error) throw error;
}

export async function listAllProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("full_name");
  if (error) throw error;
  return data;
}

// Generates a strong, random password. Never hardcoded, never logged —
// returned once to the caller so it can be shown to the admin exactly once
// and handed to the new user out of band.
function generateStrongPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = randomBytes(20);
  let password = "";
  for (const byte of bytes) {
    password += alphabet[byte % alphabet.length];
  }
  return password;
}

export interface CreateUserResult {
  email: string;
  password: string;
}

// Creates a real Supabase Auth account with a freshly generated password.
// Uses the service_role client (never exposed to the browser) because
// creating auth users requires Supabase's admin API — the anon/authenticated
// roles our normal client uses cannot do this. email_confirm is set so the
// account can sign in immediately without an email confirmation step.
export async function createTeamUser(
  email: string,
  fullName: string,
  role: UserRole,
): Promise<CreateUserResult> {
  const admin = createAdminClient();
  const password = generateStrongPassword();

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (error) throw error;
  return { email, password };
}
