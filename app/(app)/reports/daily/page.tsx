import { requireProfile } from "@/lib/auth/dal";
import { getDailyReport } from "@/lib/data/daily-activity";
import { DailyActivityForm } from "@/components/reports/daily-activity-form";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DailyActivityPage() {
  const profile = await requireProfile();
  const today = todayIso();
  const existing = await getDailyReport(profile.id, today);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily Activity</h1>
        <p className="text-muted-foreground">
          Enter today&apos;s numbers and submit — it takes a minute. Resubmitting today updates the same report.
        </p>
      </div>
      <DailyActivityForm
        teamMemberName={profile.full_name}
        today={today}
        defaultValues={
          existing
            ? {
                people_contacted: existing.people_contacted,
                calls_made: existing.calls_made,
                whatsapp_sent: existing.whatsapp_sent,
                linkedin_messages_sent: existing.linkedin_messages_sent,
                linkedin_connection_requests: existing.linkedin_connection_requests,
                instagram_outreach: existing.instagram_outreach,
                emails_sent: existing.emails_sent,
                other_outreach: existing.other_outreach,
                positive_call_replies: existing.positive_call_replies,
                positive_message_replies: existing.positive_message_replies,
                discovery_calls_booked: existing.discovery_calls_booked,
                discovery_calls_held: existing.discovery_calls_held,
                discovery_calls_no_show: existing.discovery_calls_no_show,
                qualified_leads: existing.qualified_leads,
                unqualified_leads: existing.unqualified_leads,
                sales_calls_booked: existing.sales_calls_booked,
                sales_calls_held: existing.sales_calls_held,
                deals_closed: existing.deals_closed,
                deals_lost: existing.deals_lost,
                revenue: existing.revenue,
                daily_notes: existing.daily_notes ?? "",
                main_objections: existing.main_objections ?? "",
                followups_required: existing.followups_required ?? "",
                problems_blockers: existing.problems_blockers ?? "",
              }
            : undefined
        }
      />
    </div>
  );
}
