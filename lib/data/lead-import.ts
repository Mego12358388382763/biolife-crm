import "server-only";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { leadImportRowSchema, normalizeHeader, type LeadImportRow } from "@/lib/validations/lead-import";

export interface ParsedImportRow {
  rowNumber: number;
  data: LeadImportRow | null;
  error: string | null;
}

export function parseLeadsCsv(csvText: string): ParsedImportRow[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header,
  });

  const headerMap = new Map<string, keyof LeadImportRow>();
  for (const header of result.meta.fields ?? []) {
    const normalized = normalizeHeader(header);
    if (normalized) headerMap.set(header, normalized);
  }

  return result.data.map((row, index) => {
    const mapped: Record<string, string> = {};
    for (const [rawHeader, value] of Object.entries(row)) {
      const field = headerMap.get(rawHeader);
      if (field && value) mapped[field] = String(value).trim();
    }

    const parsed = leadImportRowSchema.safeParse(mapped);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        rowNumber: index + 2, // +1 for header row, +1 for 1-indexing
        data: null,
        error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid row",
      };
    }
    return { rowNumber: index + 2, data: parsed.data, error: null };
  });
}

export interface ImportSummary {
  created: number;
  skipped: { rowNumber: number; reason: string }[];
  totalRows: number;
}

export async function importLeads(rows: ParsedImportRow[], createdBy: string): Promise<ImportSummary> {
  const supabase = await createClient();
  const summary: ImportSummary = { created: 0, skipped: [], totalRows: rows.length };

  const { data: newStage, error: stageError } = await supabase
    .from("pipeline_stages")
    .select("id")
    .eq("name", "New")
    .single();

  if (stageError || !newStage) {
    throw new Error("Could not find the 'New' pipeline stage — check pipeline_stages table.");
  }

  // Cache company name -> id lookups within this import so repeated company
  // names across rows don't each trigger a separate insert.
  const companyCache = new Map<string, string>();

  async function resolveCompanyId(name: string): Promise<string | null> {
    const key = name.toLowerCase();
    if (companyCache.has(key)) return companyCache.get(key)!;

    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", name)
      .is("deleted_at", null)
      .maybeSingle();

    if (existing) {
      companyCache.set(key, existing.id);
      return existing.id;
    }

    const { data: created, error } = await supabase
      .from("companies")
      .insert({ name, created_by: createdBy })
      .select("id")
      .single();

    if (error || !created) return null;
    companyCache.set(key, created.id);
    return created.id;
  }

  for (const row of rows) {
    if (row.error || !row.data) {
      summary.skipped.push({ rowNumber: row.rowNumber, reason: row.error ?? "Invalid row" });
      continue;
    }

    const data = row.data;

    if (data.email) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .ilike("email", data.email)
        .is("deleted_at", null)
        .maybeSingle();

      if (existingLead) {
        summary.skipped.push({ rowNumber: row.rowNumber, reason: `Duplicate email: ${data.email}` });
        continue;
      }
    }

    const companyId = data.company ? await resolveCompanyId(data.company) : null;

    const { error: insertError } = await supabase.from("leads").insert({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      linkedin_url: data.linkedin_url || null,
      job_title: data.job_title || null,
      company_id: companyId,
      country: data.country || null,
      city: data.city || null,
      source: data.source || "CSV Import",
      notes: data.notes || null,
      pipeline_stage_id: newStage.id,
      lead_score: 0,
      temperature: "cold",
      created_by: createdBy,
    });

    if (insertError) {
      summary.skipped.push({ rowNumber: row.rowNumber, reason: insertError.message });
      continue;
    }

    summary.created += 1;
  }

  return summary;
}
