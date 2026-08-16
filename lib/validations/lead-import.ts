import * as z from "zod";

// Looser than the full lead form schema — a CSV row only needs enough to
// identify a person. Everything else defaults (stage = New, temperature =
// cold, score = 0) the same way a manually created lead would.
export const leadImportRowSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  linkedin_url: z.string().trim().optional().or(z.literal("")),
  job_title: z.string().trim().optional().or(z.literal("")),
  company: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  source: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type LeadImportRow = z.infer<typeof leadImportRowSchema>;

// Recognized header aliases (lowercase, punctuation-stripped) mapped to our
// field names. A CSV exported from Excel/Google Sheets/most CRMs will match
// one of these without the user needing to rename columns first.
const HEADER_ALIASES: Record<string, keyof LeadImportRow> = {
  firstname: "first_name",
  first: "first_name",
  lastname: "last_name",
  last: "last_name",
  surname: "last_name",
  email: "email",
  emailaddress: "email",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  whatsapp: "whatsapp",
  linkedin: "linkedin_url",
  linkedinurl: "linkedin_url",
  jobtitle: "job_title",
  title: "job_title",
  position: "job_title",
  company: "company",
  companyname: "company",
  organization: "company",
  organisation: "company",
  country: "country",
  city: "city",
  source: "source",
  leadsource: "source",
  notes: "notes",
  note: "notes",
  comments: "notes",
};

export function normalizeHeader(header: string): keyof LeadImportRow | null {
  const key = header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
  return HEADER_ALIASES[key] ?? null;
}
