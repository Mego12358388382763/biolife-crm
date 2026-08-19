import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DailyActivityInput } from "@/lib/validations/daily-activity";

export async function getDailyReport(userId: string, date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_activity_reports")
    .select("*")
    .eq("user_id", userId)
    .eq("report_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function cleanInput(input: DailyActivityInput) {
  return {
    report_date: input.report_date,
    people_contacted: input.people_contacted,
    calls_made: input.calls_made,
    whatsapp_sent: input.whatsapp_sent,
    linkedin_messages_sent: input.linkedin_messages_sent,
    linkedin_connection_requests: input.linkedin_connection_requests,
    instagram_outreach: input.instagram_outreach,
    emails_sent: input.emails_sent,
    other_outreach: input.other_outreach,
    positive_call_replies: input.positive_call_replies,
    positive_message_replies: input.positive_message_replies,
    discovery_calls_booked: input.discovery_calls_booked,
    discovery_calls_held: input.discovery_calls_held,
    discovery_calls_no_show: input.discovery_calls_no_show,
    qualified_leads: input.qualified_leads,
    unqualified_leads: input.unqualified_leads,
    sales_calls_booked: input.sales_calls_booked,
    sales_calls_held: input.sales_calls_held,
    deals_closed: input.deals_closed,
    deals_lost: input.deals_lost,
    revenue: input.revenue,
    daily_notes: input.daily_notes || null,
    main_objections: input.main_objections || null,
    followups_required: input.followups_required || null,
    problems_blockers: input.problems_blockers || null,
  };
}

// One report per user per day — upsert on the (user_id, report_date)
// unique constraint so re-submitting the same day edits it in place rather
// than creating duplicates.
export async function upsertDailyReport(input: DailyActivityInput, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_activity_reports")
    .upsert({ ...cleanInput(input), user_id: userId }, { onConflict: "user_id,report_date" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
