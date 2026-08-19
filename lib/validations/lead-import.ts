import * as z from "zod";

// A CSV row only needs enough to identify a person — a name, an email, or a
// phone number. Neither first_name nor last_name is required on its own:
// many real contact lists only have a single combined name column (and for
// many naming conventions, including many Arabic names, there is no
// well-defined "last name" to extract at all), and a row with just an email
// or phone is still a perfectly usable lead. The refine() below is what
// actually enforces "must have at least one of name/email/phone" — see
// supabase/migrations/20260101000004_nullable_lead_names.sql for the
// matching database change.
export const leadImportRowSchema = z
  .object({
    first_name: z.string().trim().optional().or(z.literal("")),
    last_name: z.string().trim().optional().or(z.literal("")),
    // A single "Name" / "Full Name" column. Deliberately never auto-split
    // into first/last — guessing at a split is more likely to mangle a
    // multi-part or Arabic name than to help, now that last_name isn't
    // required. When present and first_name/last_name weren't separately
    // provided, the whole string is used as-is for first_name.
    full_name: z.string().trim().optional().or(z.literal("")),
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
  })
  .refine(
    (row) => Boolean(row.first_name || row.last_name || row.full_name || row.email || row.phone),
    { error: "Row has no name, email, or phone — nothing to identify this lead by" },
  )
  .transform((row) => {
    // Fold full_name into first_name here, once, so every downstream
    // consumer only ever has to look at first_name/last_name.
    if (!row.first_name && !row.last_name && row.full_name) {
      return { ...row, first_name: row.full_name };
    }
    return row;
  });

export type LeadImportRow = z.infer<typeof leadImportRowSchema>;

// Fields recognized directly from a CSV header, before Zod validation.
type ImportField = keyof LeadImportRow;

// Recognized header aliases mapped to our field names. Keys here are
// produced by normalizeHeader (lowercased, whitespace/underscore/hyphen
// stripped) so e.g. "First Name", "first_name", "First-Name" all match
// "firstname". Includes common Arabic equivalents.
const HEADER_ALIASES: Record<string, ImportField> = {
  // Name
  name: "full_name",
  fullname: "full_name",
  contactname: "full_name",
  leadname: "full_name",
  firstname: "first_name",
  first: "first_name",
  givenname: "first_name",
  lastname: "last_name",
  last: "last_name",
  surname: "last_name",
  familyname: "last_name",
  // Email
  email: "email",
  emailaddress: "email",
  emailid: "email",
  // Phone
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  mobilenumber: "phone",
  cell: "phone",
  // WhatsApp / LinkedIn
  whatsapp: "whatsapp",
  whatsappnumber: "whatsapp",
  linkedin: "linkedin_url",
  linkedinurl: "linkedin_url",
  linkedinprofile: "linkedin_url",
  // Company / role
  jobtitle: "job_title",
  title: "job_title",
  position: "job_title",
  role: "job_title",
  company: "company",
  companyname: "company",
  organization: "company",
  organisation: "company",
  employer: "company",
  // Location
  country: "country",
  city: "city",
  // Source / notes
  source: "source",
  leadsource: "source",
  notes: "notes",
  note: "notes",
  comments: "notes",
  // Arabic equivalents (normalized the same way — see normalizeHeader;
  // Arabic script is preserved rather than stripped, so these keys are the
  // literal Arabic words with internal spaces removed).
  الاسم: "full_name",
  الاسمالكامل: "full_name",
  اسمالعميل: "full_name",
  الاسمالاول: "first_name",
  اسمالعائلة: "last_name",
  الكنية: "last_name",
  البريدالالكتروني: "email",
  البريد: "email",
  الهاتف: "phone",
  رقمالهاتف: "phone",
  الجوال: "phone",
  الشركة: "company",
  المسمىالوظيفي: "job_title",
  الدولة: "country",
  البلد: "country",
  المدينة: "city",
  المصدر: "source",
  ملاحظات: "notes",
};

// Strips whitespace/underscores/hyphens and lowercases (Latin letters only —
// Arabic and other scripts have no case). Deliberately does NOT strip
// non-ASCII letters, unlike a naive `[^a-z0-9]` filter would: that would
// reduce every Arabic header to an empty string and silently drop it.
export function normalizeHeader(header: string): ImportField | null {
  const key = header
    .replace(/^﻿/, "") // strip a stray BOM if it ended up mid-string
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  return HEADER_ALIASES[key] ?? null;
}
