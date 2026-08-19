import * as z from "zod";

// Every counter defaults to 0 via coerce so an empty/untouched number input
// never becomes NaN or undefined — the whole point of this form is that a
// team member can submit it in under a minute, which means most fields will
// often be left at their default.
const count = () => z.coerce.number().int().min(0).default(0);

export const dailyActivitySchema = z.object({
  report_date: z.string().min(1, "Date is required"),

  people_contacted: count(),
  calls_made: count(),
  whatsapp_sent: count(),
  linkedin_messages_sent: count(),
  linkedin_connection_requests: count(),
  instagram_outreach: count(),
  emails_sent: count(),
  other_outreach: count(),

  positive_call_replies: count(),
  positive_message_replies: count(),

  discovery_calls_booked: count(),
  discovery_calls_held: count(),
  discovery_calls_no_show: count(),

  qualified_leads: count(),
  unqualified_leads: count(),

  sales_calls_booked: count(),
  sales_calls_held: count(),
  deals_closed: count(),
  deals_lost: count(),
  revenue: z.coerce.number().min(0).default(0),

  daily_notes: z.string().trim().optional().or(z.literal("")),
  main_objections: z.string().trim().optional().or(z.literal("")),
  followups_required: z.string().trim().optional().or(z.literal("")),
  problems_blockers: z.string().trim().optional().or(z.literal("")),
});

export type DailyActivityInput = z.infer<typeof dailyActivitySchema>;

export const OUTREACH_FIELDS = [
  { key: "calls_made", label: "Calls Made" },
  { key: "whatsapp_sent", label: "WhatsApp Messages Sent" },
  { key: "linkedin_messages_sent", label: "LinkedIn Messages Sent" },
  { key: "linkedin_connection_requests", label: "LinkedIn Connection Requests" },
  { key: "instagram_outreach", label: "Instagram Outreach" },
  { key: "emails_sent", label: "Emails Sent" },
  { key: "other_outreach", label: "Other Outreach" },
] as const;
