import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { LeadInput } from "@/lib/validations/lead";

const LEAD_SELECT =
  "*, companies(name), pipeline_stages(id, name, position), profiles!leads_assigned_to_fkey(full_name)";

export interface LeadFilters {
  search?: string;
  stageId?: string;
  assignedTo?: string;
  temperature?: string;
}

export async function listLeads(filters: LeadFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select(LEAD_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
    );
  }
  if (filters.stageId) query = query.eq("pipeline_stage_id", filters.stageId);
  if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
  if (filters.temperature) query = query.eq("temperature", filters.temperature);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getLead(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  if (error) throw error;
  return data;
}

export async function listLeadsForPipeline() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, companies(name), profiles!leads_assigned_to_fkey(full_name)")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLeadStageHistory(leadId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_stage_history")
    .select(
      "*, from_stage:pipeline_stages!lead_stage_history_from_stage_id_fkey(name), to_stage:pipeline_stages!lead_stage_history_to_stage_id_fkey(name), profiles(full_name)",
    )
    .eq("lead_id", leadId)
    .order("changed_at", { ascending: false });
  if (error) throw error;
  return data;
}

function cleanLeadInput(input: LeadInput) {
  return {
    first_name: input.first_name,
    last_name: input.last_name,
    job_title: input.job_title || null,
    company_id: input.company_id || null,
    email: input.email || null,
    phone: input.phone || null,
    whatsapp: input.whatsapp || null,
    linkedin_url: input.linkedin_url || null,
    country: input.country || null,
    city: input.city || null,
    source: input.source || null,
    pipeline_stage_id: input.pipeline_stage_id,
    assigned_to: input.assigned_to || null,
    lead_score: input.lead_score,
    temperature: input.temperature,
    next_follow_up_at: input.next_follow_up_at || null,
    notes: input.notes || null,
  };
}

export async function createLead(input: LeadInput, createdBy: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({ ...cleanLeadInput(input), created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLead(id: string, input: LeadInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update(cleanLeadInput(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Moves a lead to a new pipeline stage. The DB trigger
// record_lead_stage_change() automatically appends a lead_stage_history row,
// so this only needs to update the lead itself — but we keep this as a
// single named operation so the "reliable, atomic move" requirement is
// obvious at the call site.
export async function moveLeadStage(leadId: string, toStageId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ pipeline_stage_id: toStageId, last_contact_at: new Date().toISOString() })
    .eq("id", leadId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteLeads(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().in("id", ids);
  if (error) throw error;
}

export async function listPipelineStages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("active", true)
    .order("position");
  if (error) throw error;
  return data;
}
