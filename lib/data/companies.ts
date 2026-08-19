import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CompanyInput } from "@/lib/validations/company";

export async function listCompanies(search?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("companies")
    .select("*")
    .is("deleted_at", null)
    .order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCompany(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  if (error) throw error;
  return data;
}

export async function getCompanyLeads(companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, pipeline_stages(name), profiles!leads_assigned_to_fkey(full_name)")
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

function cleanCompanyInput(input: CompanyInput) {
  return {
    name: input.name,
    website: input.website || null,
    industry: input.industry || null,
    country: input.country || null,
    city: input.city || null,
    company_size: input.company_size || null,
    notes: input.notes || null,
  };
}

export async function createCompany(input: CompanyInput, createdBy: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({ ...cleanCompanyInput(input), created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCompany(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
}

export async function updateCompany(id: string, input: CompanyInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .update(cleanCompanyInput(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
