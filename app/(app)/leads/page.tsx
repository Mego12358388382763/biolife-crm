import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listLeads } from "@/lib/data/leads";
import { listPipelineStages } from "@/lib/data/leads";
import { requireProfile, canWrite } from "@/lib/auth/dal";

const TEMPERATURE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  hot: "default",
  warm: "secondary",
  cold: "outline",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string; temperature?: string }>;
}) {
  const params = await searchParams;
  const [profile, stages, leads] = await Promise.all([
    requireProfile(),
    listPipelineStages(),
    listLeads({ search: params.q, stageId: params.stage, temperature: params.temperature }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-muted-foreground">{leads.length} leads</p>
        </div>
        {canWrite(profile) && (
          <Button render={<Link href="/leads/new" />} nativeButton={false}>
            New lead
          </Button>
        )}
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <Input name="q" placeholder="Search name or email" defaultValue={params.q} className="max-w-xs" />
        <Select name="stage" defaultValue={params.stage}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name="temperature" defaultValue={params.temperature}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All temperatures" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Next Follow-up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
            {leads.map((lead) => (
              <TableRow key={lead.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                    {lead.first_name} {lead.last_name}
                  </Link>
                  <Badge variant={TEMPERATURE_VARIANT[lead.temperature]} className="ml-2 capitalize">
                    {lead.temperature}
                  </Badge>
                </TableCell>
                <TableCell>{lead.companies?.name ?? "—"}</TableCell>
                <TableCell>{lead.job_title ?? "—"}</TableCell>
                <TableCell>{lead.country ?? "—"}</TableCell>
                <TableCell>{lead.source ?? "—"}</TableCell>
                <TableCell>{lead.pipeline_stages?.name ?? "—"}</TableCell>
                <TableCell>{lead.lead_score}</TableCell>
                <TableCell>{lead.profiles?.full_name ?? "Unassigned"}</TableCell>
                <TableCell>
                  {lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
