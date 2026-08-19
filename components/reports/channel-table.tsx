import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ChannelVolume } from "@/lib/data/performance";

export function ChannelTable({ channels }: { channels: ChannelVolume[] }) {
  const total = channels.reduce((sum, c) => sum + c.contacted, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Channel Performance</CardTitle>
        <CardDescription>
          Outreach volume by channel from daily activity reports. Downstream conversion (replies, bookings, deals) by
          channel requires linking outreach to lead source and is planned as a follow-up phase — not shown here to
          avoid implying precision the data doesn&apos;t yet support.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Contacted</TableHead>
              <TableHead>Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels.map((c) => (
              <TableRow key={c.channel}>
                <TableCell className="font-medium">{c.channel}</TableCell>
                <TableCell>{c.contacted}</TableCell>
                <TableCell>{total > 0 ? Math.round((c.contacted / total) * 1000) / 10 : 0}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
