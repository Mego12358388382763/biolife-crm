"use server";

import { revalidatePath } from "next/cache";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { buildImportPreview, commitImport, type ImportPreview, type ImportResult, type PreviewRow } from "@/lib/data/lead-import";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface PreviewFormState {
  error?: string;
  preview?: ImportPreview;
}

export async function previewImportAction(_prevState: PreviewFormState, formData: FormData): Promise<PreviewFormState> {
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

  let preview: ImportPreview;
  try {
    preview = await buildImportPreview(text);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to read the file." };
  }

  if (preview.totalRows === 0) {
    return { error: "No rows found in the file." };
  }

  return { preview };
}

// Takes the exact rows the admin already saw in the preview (with their
// valid/duplicate/invalid status already computed) rather than the raw
// file, so what gets imported matches what was shown on screen.
export async function commitImportAction(rows: PreviewRow[]): Promise<ImportResult> {
  const profile = await requireProfile();
  if (!canWrite(profile)) {
    throw new Error("You do not have permission to import leads.");
  }

  const result = await commitImport(rows, profile.id);
  revalidatePath("/leads");
  return result;
}
