import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildFunnel } from "@/lib/reporting";
import type { ActivityTotals } from "@/lib/data/performance";

export function FunnelChart({ totals }: { totals: ActivityTotals }) {
  const stages = buildFunnel({
    peopleContacted: totals.peopleContacted,
    positiveReplies: totals.positiveCallReplies + totals.positiveMessageReplies,
    discoveryBooked: totals.discoveryCallsBooked,
    discoveryHeld: totals.discoveryCallsHeld,
    qualified: totals.qualifiedLeads,
    salesCallsHeld: totals.salesCallsHeld,
    dealsClosed: totals.dealsClosed,
  });

  const maxCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stages.map((stage) => (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{stage.label}</span>
              <span className="text-muted-foreground">
                {stage.count.toLocaleString()}
                {stage.rateFromPrevious !== null && ` — ${stage.rateFromPrevious}%`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.max(2, (stage.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
