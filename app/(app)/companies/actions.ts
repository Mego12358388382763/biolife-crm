"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { companySchema } from "@/lib/validations/company";
import { createCompany, updateCompany } from "@/lib/data/companies";

export interface CompanyFormState {
  error?: string;
  errors?: Record<string, string[]>;
}

function parseCompanyFormData(formData: FormData) {
  return companySchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    industry: formData.get("industry"),
    country: formData.get("country"),
    city: formData.get("city"),
    company_size: formData.get("company_size"),
    notes: formData.get("notes"),
  });
}

export async function createCompanyAction(
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const profile = await requireProfile();
  if (!canWrite(profile)) {
    return { error: "You do not have permission to create companies." };
  }

  const parsed = parseCompanyFormData(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  let company;
  try {
    company = await createCompany(parsed.data, profile.id);
  } catch {
    return { error: "Failed to create company. Please try again." };
  }

  revalidatePath("/companies");
  redirect(`/companies/${company.id}`);
}

export async function updateCompanyAction(
  companyId: string,
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const profile = await requireProfile();
  if (!canWrite(profile)) {
    return { error: "You do not have permission to edit companies." };
  }

  const parsed = parseCompanyFormData(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await updateCompany(companyId, parsed.data);
  } catch {
    return { error: "Failed to update company. Please try again." };
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}
