import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ActivityTotals {
  peopleContacted: number;
  callsMade: number;
  whatsappSent: number;
  linkedinMessagesSent: number;
  linkedinConnectionRequests: number;
  instagramOutreach: number;
  emailsSent: number;
  otherOutreach: number;
  positiveCallReplies: number;
  positiveMessageReplies: number;
  discoveryCallsBooked: number;
  discoveryCallsHeld: number;
  discoveryCallsNoShow: number;
  qualifiedLeads: number;
  unqualifiedLeads: number;
  salesCallsBooked: number;
  salesCallsHeld: number;
  dealsClosed: number;
  dealsLost: number;
  revenue: number;
}

const EMPTY_TOTALS: ActivityTotals = {
  peopleContacted: 0,
  callsMade: 0,
  whatsappSent: 0,
  linkedinMessagesSent: 0,
  linkedinConnectionRequests: 0,
  instagramOutreach: 0,
  emailsSent: 0,
  otherOutreach: 0,
  positiveCallReplies: 0,
  positiveMessageReplies: 0,
  discoveryCallsBooked: 0,
  discoveryCallsHeld: 0,
  discoveryCallsNoShow: 0,
  qualifiedLeads: 0,
  unqualifiedLeads: 0,
  salesCallsBooked: 0,
  salesCallsHeld: 0,
  dealsClosed: 0,
  dealsLost: 0,
  revenue: 0,
};

export interface PerformanceFilters {
  startDate: string; // inclusive, YYYY-MM-DD
  endDate: string; // inclusive, YYYY-MM-DD
  userId?: string; // omit for all team members (admin only — caller enforces this)
}

interface RawRow {
  user_id: string;
  people_contacted: number;
  calls_made: number;
  whatsapp_sent: number;
  linkedin_messages_sent: number;
  linkedin_connection_requests: number;
  instagram_outreach: number;
  emails_sent: number;
  other_outreach: number;
  positive_call_replies: number;
  positive_message_replies: number;
  discovery_calls_booked: number;
  discovery_calls_held: number;
  discovery_calls_no_show: number;
  qualified_leads: number;
  unqualified_leads: number;
  sales_calls_booked: number;
  sales_calls_held: number;
  deals_closed: number;
  deals_lost: number;
  revenue: number;
}

async function fetchRows(filters: PerformanceFilters): Promise<RawRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("daily_activity_reports")
    .select("*")
    .gte("report_date", filters.startDate)
    .lte("report_date", filters.endDate);

  if (filters.userId) query = query.eq("user_id", filters.userId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as RawRow[];
}

function sumRows(rows: RawRow[]): ActivityTotals {
  return rows.reduce<ActivityTotals>(
    (acc, r) => ({
      peopleContacted: acc.peopleContacted + r.people_contacted,
      callsMade: acc.callsMade + r.calls_made,
      whatsappSent: acc.whatsappSent + r.whatsapp_sent,
      linkedinMessagesSent: acc.linkedinMessagesSent + r.linkedin_messages_sent,
      linkedinConnectionRequests: acc.linkedinConnectionRequests + r.linkedin_connection_requests,
      instagramOutreach: acc.instagramOutreach + r.instagram_outreach,
      emailsSent: acc.emailsSent + r.emails_sent,
      otherOutreach: acc.otherOutreach + r.other_outreach,
      positiveCallReplies: acc.positiveCallReplies + r.positive_call_replies,
      positiveMessageReplies: acc.positiveMessageReplies + r.positive_message_replies,
      discoveryCallsBooked: acc.discoveryCallsBooked + r.discovery_calls_booked,
      discoveryCallsHeld: acc.discoveryCallsHeld + r.discovery_calls_held,
      discoveryCallsNoShow: acc.discoveryCallsNoShow + r.discovery_calls_no_show,
      qualifiedLeads: acc.qualifiedLeads + r.qualified_leads,
      unqualifiedLeads: acc.unqualifiedLeads + r.unqualified_leads,
      salesCallsBooked: acc.salesCallsBooked + r.sales_calls_booked,
      salesCallsHeld: acc.salesCallsHeld + r.sales_calls_held,
      dealsClosed: acc.dealsClosed + r.deals_closed,
      dealsLost: acc.dealsLost + r.deals_lost,
      revenue: acc.revenue + Number(r.revenue),
    }),
    { ...EMPTY_TOTALS },
  );
}

export async function getActivityTotals(filters: PerformanceFilters): Promise<ActivityTotals> {
  const rows = await fetchRows(filters);
  return sumRows(rows);
}

export interface TeamMemberPerformance {
  userId: string;
  fullName: string;
  totals: ActivityTotals;
}

// One row per team member with their own totals for the same filtered
// range — deliberately keeps every activity number next to its conversion
// rate (computed by the caller via safeRate) rather than a raw activity
// leaderboard.
export async function getTeamPerformance(filters: Omit<PerformanceFilters, "userId">): Promise<TeamMemberPerformance[]> {
  const supabase = await createClient();
  const rows = await fetchRows(filters);

  const byUser = new Map<string, RawRow[]>();
  for (const row of rows) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  if (byUser.size === 0) return [];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", [...byUser.keys()]);
  if (error) throw error;

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name as string]));

  return [...byUser.entries()]
    .map(([userId, userRows]) => ({
      userId,
      fullName: nameById.get(userId) ?? "Unknown",
      totals: sumRows(userRows),
    }))
    .sort((a, b) => b.totals.dealsClosed - a.totals.dealsClosed);
}

export interface ChannelVolume {
  channel: string;
  contacted: number;
}

// Honest scope: the daily report captures outreach VOLUME per channel
// (calls, WhatsApp, LinkedIn messages + connection requests, Instagram,
// email, other). It does not capture which channel a positive reply,
// discovery booking, or deal came from — that would need either a channel
// field on each response/outcome (more form fields, against the "submit in
// a minute" goal) or deriving it from leads.source per lead, which is
// deferred, documented follow-up work rather than something faked here.
export async function getChannelVolumes(filters: PerformanceFilters): Promise<ChannelVolume[]> {
  const totals = await getActivityTotals(filters);
  return [
    { channel: "Call", contacted: totals.callsMade },
    { channel: "WhatsApp", contacted: totals.whatsappSent },
    { channel: "LinkedIn", contacted: totals.linkedinMessagesSent + totals.linkedinConnectionRequests },
    { channel: "Instagram", contacted: totals.instagramOutreach },
    { channel: "Email", contacted: totals.emailsSent },
    { channel: "Other", contacted: totals.otherOutreach },
  ];
}
