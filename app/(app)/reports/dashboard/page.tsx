import { requireProfile } from "@/lib/auth/dal";
import { listActiveProfiles } from "@/lib/data/profiles";
import { getActivityTotals, getTeamPerformance, getChannelVolumes } from "@/lib/data/performance";
import { resolveDateRange, type DateRangePreset } from "@/lib/date-ranges";
import { DashboardFilters } from "@/components/reports/dashboard-filters";
import { KpiCards } from "@/components/reports/kpi-cards";
import { FunnelChart } from "@/components/reports/funnel-chart";
import { TeamPerformanceTable } from "@/components/reports/team-performance-table";
import { ChannelTable } from "@/components/reports/channel-table";

export default async function PerformanceDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; start?: string; end?: string; user?: string }>;
}) {
  const profile = await requireProfile();
  const params = await searchParams;
  const isAdmin = profile.role === "admin";

  const preset = (params.preset as DateRangePreset) ?? "this_week";
  const range = resolveDateRange(preset, params.start, params.end);

  // Non-admins can only ever see their own data — the `user` query param is
  // ignored for them, not merely hidden from the UI, so this can't be
  // bypassed by editing the URL.
  const filterUserId = isAdmin ? (params.user && params.user !== "all" ? params.user : undefined) : profile.id;

  const [totals, channels, teamMembers] = await Promise.all([
    getActivityTotals({ startDate: range.start, endDate: range.end, userId: filterUserId }),
    getChannelVolumes({ startDate: range.start, endDate: range.end, userId: filterUserId }),
    isAdmin ? listActiveProfiles() : Promise.resolve([]),
  ]);

  const teamPerformance = isAdmin
    ? await getTeamPerformance({ startDate: range.start, endDate: range.end })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Performance Dashboard</h1>
        <p className="text-muted-foreground">
          {range.start === range.end ? range.start : `${range.start} – ${range.end}`}
        </p>
      </div>

      <DashboardFilters
        preset={preset}
        start={range.start}
        end={range.end}
        userId={filterUserId}
        teamMembers={teamMembers}
        isAdmin={isAdmin}
      />

      <KpiCards totals={totals} />
      <FunnelChart totals={totals} />
      <ChannelTable channels={channels} />
      {isAdmin && <TeamPerformanceTable members={teamPerformance} />}
    </div>
  );
}
