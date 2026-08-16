import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listActiveProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("active", true)
    .order("full_name");
  if (error) throw error;
  return data;
}
