"use server";

import { revalidatePath } from "next/cache";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { parseLeadsCsv, importLeads, type ImportSummary } from "@/lib/data/lead-import";

export interface ImportFormState {
  error?: string;
  summary?: ImportSummary;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function importLeadsAction(_prevState: ImportFormState, formData: FormData): Promise<ImportFormState> {
  const profile = await requireProfile();
  if (!canWrite(profile)) {
    return { error: "You do not have permission to import leads." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a CSV file." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File is too large (max 5MB)." };
  }
  if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
    return { error: "Only CSV files are supported. Export your spreadsheet as CSV first." };
  }

  const text = await file.text();
  const rows = parseLeadsCsv(text);

  if (rows.length === 0) {
    return { error: "No rows found in the file." };
  }

  let summary: ImportSummary;
  try {
    summary = await importLeads(rows, profile.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Import failed." };
  }

  revalidatePath("/leads");
  return { summary };
}
