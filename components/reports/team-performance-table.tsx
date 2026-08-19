import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { safeRate } from "@/lib/reporting";
import type { TeamMemberPerformance } from "@/lib/data/performance";

// Activity volume and conversion quality shown side by side on purpose —
// a high-volume, low-conversion row is meant to be visible as exactly
// that, not to read as "top performer" the way a raw contact-count
// leaderboard would.
export function TeamPerformanceTable({ members }: { members: TeamMemberPerformance[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Member</TableHead>
              <TableHead>Contacted</TableHead>
              <TableHead>Positive Replies</TableHead>
              <TableHead>Reply Rate</TableHead>
              <TableHead>Discovery Booked</TableHead>
              <TableHead>Discovery Held</TableHead>
              <TableHead>Qualified</TableHead>
              <TableHead>Sales Calls</TableHead>
              <TableHead>Deals Closed</TableHead>
              <TableHead>Close Rate</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  No activity reports in this range.
                </TableCell>
              </TableRow>
            )}
            {members.map((m) => {
              const totalPositive = m.totals.positiveCallReplies + m.totals.positiveMessageReplies;
              return (
                <TableRow key={m.userId}>
                  <TableCell className="font-medium">{m.fullName}</TableCell>
                  <TableCell>{m.totals.peopleContacted}</TableCell>
                  <TableCell>{totalPositive}</TableCell>
                  <TableCell>{safeRate(totalPositive, m.totals.peopleContacted)}%</TableCell>
                  <TableCell>{m.totals.discoveryCallsBooked}</TableCell>
                  <TableCell>{m.totals.discoveryCallsHeld}</TableCell>
                  <TableCell>{m.totals.qualifiedLeads}</TableCell>
                  <TableCell>{m.totals.salesCallsHeld}</TableCell>
                  <TableCell>{m.totals.dealsClosed}</TableCell>
                  <TableCell>{safeRate(m.totals.dealsClosed, m.totals.salesCallsHeld)}%</TableCell>
                  <TableCell>{m.totals.revenue.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
