import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// first_name/last_name are nullable (a lead can be identified by only an
// email or phone — see supabase/migrations/20260101000004_nullable_lead_names.sql).
// Use this instead of `${lead.first_name} ${lead.last_name}` anywhere that
// isn't plain JSX children, since a template literal stringifies null as
// the text "null" rather than omitting it the way JSX rendering does.
export function leadDisplayName(lead: {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
}): string {
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim()
  if (name) return name
  if (lead.email) return lead.email
  if (lead.phone) return lead.phone
  return "Unnamed lead"
}
