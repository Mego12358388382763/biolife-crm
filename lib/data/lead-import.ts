import "server-only";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { leadImportRowSchema, normalizeHeader, type LeadImportRow } from "@/lib/validations/lead-import";

interface ParsedRow {
  rowNumber: number;
  data: LeadImportRow | null;
  parseError: string | null;
}

export interface ColumnMapping {
  detectedColumns: string[];
  mappedFields: { column: string; field: string }[];
  unmappedColumns: string[];
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function parseLeadsCsv(csvText: string): { rows: ParsedRow[]; mapping: ColumnMapping } {
  const result = Papa.parse<Record<string, string>>(stripBom(csvText), {
    header: true,
    skipEmptyLines: true,
  });

  const detectedColumns = result.meta.fields ?? [];
  const headerMap = new Map<string, keyof LeadImportRow>();
  const mappedFields: { column: string; field: string }[] = [];
  const unmappedColumns: string[] = [];

  for (const header of detectedColumns) {
    const normalized = normalizeHeader(header);
    if (normalized) {
      headerMap.set(header, normalized);
      mappedFields.push({ column: header, field: normalized });
    } else {
      unmappedColumns.push(header);
    }
  }

  const rows: ParsedRow[] = result.data.map((raw, index) => {
    const mapped: Record<string, string> = {};
    for (const [rawHeader, value] of Object.entries(raw)) {
      const field = headerMap.get(rawHeader);
      if (field && value) mapped[field] = String(value).trim();
    }

    const parsed = leadImportRowSchema.safeParse(mapped);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { rowNumber: index + 2, data: null, parseError: firstIssue?.message ?? "Invalid row" };
    }
    return { rowNumber: index + 2, data: parsed.data, parseError: null };
  });

  return { rows, mapping: { detectedColumns, mappedFields, unmappedColumns } };
}

// Keeps a leading "+" (international prefix) and strips everything else
// that isn't a digit, so "+44 7700 900123" and "+44-7700-900123" dedupe as
// the same number regardless of formatting.
function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^0-9]/g, "");
}

export type RowStatus = "valid" | "duplicate" | "invalid";

export interface PreviewRow {
  rowNumber: number;
  status: RowStatus;
  reason?: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  linkedin_url: string | null;
  company: string | null;
  job_title: string | null;
  country: string | null;
  city: string | null;
  source: string | null;
  notes: string | null;
}

export interface ImportPreview {
  totalRows: number;
  mapping: ColumnMapping;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  sampleRows: PreviewRow[];
  rows: PreviewRow[];
}

// Parses, validates, and classifies every row (valid / duplicate / invalid)
// without writing anything — used to render the preview screen before the
// admin commits. Duplicate checks compare against both existing DB records
// and other rows earlier in the same file (two rows in one CSV sharing an
// email should also be caught, not just DB collisions).
export async function buildImportPreview(csvText: string): Promise<ImportPreview> {
  const { rows, mapping } = parseLeadsCsv(csvText);
  const supabase = await createClient();

  // One batched fetch instead of a query per row — with 1000+ rows, N
  // per-row lookups is the difference between a preview that renders in
  // under a second and one that times out.
  const { data: existingLeads } = await supabase.from("leads").select("email, phone").is("deleted_at", null);

  const existingEmails = new Set(
    (existingLeads ?? []).filter((l) => l.email).map((l) => l.email!.toLowerCase()),
  );
  const existingPhones = new Set(
    (existingLeads ?? []).filter((l) => l.phone).map((l) => normalizePhone(l.phone!)),
  );
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();

  const previewRows: PreviewRow[] = rows.map((row) => {
    const base = {
      rowNumber: row.rowNumber,
      first_name: row.data?.first_name || null,
      last_name: row.data?.last_name || null,
      email: row.data?.email || null,
      phone: row.data?.phone || null,
      whatsapp: row.data?.whatsapp || null,
      linkedin_url: row.data?.linkedin_url || null,
      company: row.data?.company || null,
      job_title: row.data?.job_title || null,
      country: row.data?.country || null,
      city: row.data?.city || null,
      source: row.data?.source || null,
      notes: row.data?.notes || null,
    };

    if (!row.data) {
      return { ...base, status: "invalid" as const, reason: row.parseError ?? "Invalid row" };
    }

    const emailKey = row.data.email ? row.data.email.toLowerCase() : null;
    const phoneKey = row.data.phone ? normalizePhone(row.data.phone) : null;

    if (emailKey && (existingEmails.has(emailKey) || seenEmails.has(emailKey))) {
      return { ...base, status: "duplicate" as const, reason: `Duplicate email: ${row.data.email}` };
    }
    if (phoneKey && (existingPhones.has(phoneKey) || seenPhones.has(phoneKey))) {
      return { ...base, status: "duplicate" as const, reason: `Duplicate phone: ${row.data.phone}` };
    }

    if (emailKey) seenEmails.add(emailKey);
    if (phoneKey) seenPhones.add(phoneKey);

    return { ...base, status: "valid" as const };
  });

  return {
    totalRows: rows.length,
    mapping,
    validCount: previewRows.filter((r) => r.status === "valid").length,
    duplicateCount: previewRows.filter((r) => r.status === "duplicate").length,
    invalidCount: previewRows.filter((r) => r.status === "invalid").length,
    sampleRows: previewRows.filter((r) => r.status === "valid").slice(0, 5),
    rows: previewRows,
  };
}

export interface ImportResult {
  created: number;
  duplicates: number;
  invalid: number;
  errors: { rowNumber: number; reason: string }[];
}

// Inserts every row already marked "valid" by buildImportPreview. Rows
// marked duplicate/invalid are counted but never inserted. Re-checks email
// uniqueness immediately before each insert as a defensive measure against
// a stale preview (time elapsed between preview and confirm).
export async function commitImport(rows: PreviewRow[], createdBy: string): Promise<ImportResult> {
  const supabase = await createClient();
  const result: ImportResult = { created: 0, duplicates: 0, invalid: 0, errors: [] };

  const { data: newStage, error: stageError } = await supabase
    .from("pipeline_stages")
    .select("id")
    .eq("name", "New")
    .single();

  if (stageError || !newStage) {
    throw new Error("Could not find the 'New' pipeline stage — check pipeline_stages table.");
  }

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
    if (row.status === "duplicate") {
      result.duplicates += 1;
      continue;
    }
    if (row.status === "invalid") {
      result.invalid += 1;
      result.errors.push({ rowNumber: row.rowNumber, reason: row.reason ?? "Invalid row" });
      continue;
    }

    if (row.email) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .ilike("email", row.email)
        .is("deleted_at", null)
        .maybeSingle();
      if (existingLead) {
        result.duplicates += 1;
        continue;
      }
    }

    const companyId = row.company ? await resolveCompanyId(row.company) : null;

    const { error: insertError } = await supabase.from("leads").insert({
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp,
      linkedin_url: row.linkedin_url,
      job_title: row.job_title,
      company_id: companyId,
      country: row.country,
      city: row.city,
      source: row.source || "CSV Import",
      notes: row.notes,
      pipeline_stage_id: newStage.id,
      lead_score: 0,
      temperature: "cold",
      created_by: createdBy,
    });

    if (insertError) {
      result.invalid += 1;
      result.errors.push({ rowNumber: row.rowNumber, reason: insertError.message });
      continue;
    }

    result.created += 1;
  }

  return result;
}
