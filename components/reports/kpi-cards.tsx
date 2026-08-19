import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { safeRate } from "@/lib/reporting";
import type { ActivityTotals } from "@/lib/data/performance";

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent />
    </Card>
  );
}

// Deliberately not all 18 possible numbers — the most load-bearing subset,
// so the dashboard reads at a glance instead of turning into a wall of
// tiles. Everything else is still available via the funnel/team/channel
// sections below.
export function KpiCards({ totals }: { totals: ActivityTotals }) {
  const totalPositive = totals.positiveCallReplies + totals.positiveMessageReplies;
  const positiveReplyRate = safeRate(totalPositive, totals.peopleContacted);
  const bookingRate = safeRate(totals.discoveryCallsBooked, totalPositive);
  const showUpRate = safeRate(totals.discoveryCallsHeld, totals.discoveryCallsBooked);
  const qualificationRate = safeRate(totals.qualifiedLeads, totals.discoveryCallsHeld);
  const closeRate = safeRate(totals.dealsClosed, totals.salesCallsHeld);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <Kpi label="People Contacted" value={totals.peopleContacted} />
      <Kpi label="Positive Replies" value={totalPositive} />
      <Kpi label="Positive Reply Rate" value={`${positiveReplyRate}%`} />
      <Kpi label="Discovery Calls Booked" value={totals.discoveryCallsBooked} />
      <Kpi label="Booking Rate" value={`${bookingRate}%`} />
      <Kpi label="Discovery Calls Held" value={totals.discoveryCallsHeld} />
      <Kpi label="Show-up Rate" value={`${showUpRate}%`} />
      <Kpi label="Qualified Leads" value={totals.qualifiedLeads} />
      <Kpi label="Qualification Rate" value={`${qualificationRate}%`} />
      <Kpi label="Deals Closed" value={totals.dealsClosed} />
      <Kpi label="Close Rate" value={`${closeRate}%`} />
      <Kpi label="Revenue" value={totals.revenue.toLocaleString("en-GB", { style: "currency", currency: "GBP" })} />
    </div>
  );
}
