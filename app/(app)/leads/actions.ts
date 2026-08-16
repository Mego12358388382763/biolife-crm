"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { leadSchema } from "@/lib/validations/lead";
import { createLead, updateLead, moveLeadStage } from "@/lib/data/leads";

export interface LeadFormState {
  error?: string;
  errors?: Record<string, string[]>;
}

function parseLeadFormData(formData: FormData) {
  return leadSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    job_title: formData.get("job_title"),
    company_id: formData.get("company_id"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    linkedin_url: formData.get("linkedin_url"),
    country: formData.get("country"),
    city: formData.get("city"),
    source: formData.get("source"),
    pipeline_stage_id: formData.get("pipeline_stage_id"),
    assigned_to: formData.get("assigned_to"),
    lead_score: formData.get("lead_score"),
    temperature: formData.get("temperature"),
    next_follow_up_at: formData.get("next_follow_up_at"),
    notes: formData.get("notes"),
  });
}

export async function createLeadAction(_prevState: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const profile = await requireProfile();
  if (!canWrite(profile)) {
    return { error: "You do not have permission to create leads." };
  }

  const parsed = parseLeadFormData(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  let lead;
  try {
    lead = await createLead(parsed.data, profile.id);
  } catch {
    return { error: "Failed to create lead. Please try again." };
  }

  revalidatePath("/leads");
  redirect(`/leads/${lead.id}`);
}

export async function updateLeadAction(
  leadId: string,
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const profile = await requireProfile();
  if (!canWrite(profile)) {
    return { error: "You do not have permission to edit leads." };
  }

  const parsed = parseLeadFormData(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await updateLead(leadId, parsed.data);
  } catch {
    return { error: "Failed to update lead. Please try again." };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  redirect(`/leads/${leadId}`);
}

export async function moveLeadStageAction(leadId: string, toStageId: string) {
  const profile = await requireProfile();
  if (!canWrite(profile)) {
    throw new Error("You do not have permission to move leads.");
  }
  await moveLeadStage(leadId, toStageId);
  revalidatePath("/pipeline");
  revalidatePath(`/leads/${leadId}`);
}
