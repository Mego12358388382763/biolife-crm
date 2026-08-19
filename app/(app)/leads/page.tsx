import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadsTable } from "@/components/leads/leads-table";
import { listLeads, listPipelineStages } from "@/lib/data/leads";
import { requireProfile, canWrite } from "@/lib/auth/dal";

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
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href="/leads/import" />} nativeButton={false}>
              Import CSV
            </Button>
            <Button render={<Link href="/leads/new" />} nativeButton={false}>
              New lead
            </Button>
          </div>
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

      <LeadsTable leads={leads} isAdmin={profile.role === "admin"} />
    </div>
  );
}
