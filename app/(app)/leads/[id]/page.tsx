import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadForm } from "@/components/leads/lead-form";
import { DeleteLeadButton } from "@/components/leads/delete-lead-button";
import { getLead, getLeadStageHistory } from "@/lib/data/leads";
import { listCompanies } from "@/lib/data/companies";
import { listPipelineStages } from "@/lib/data/leads";
import { listActiveProfiles } from "@/lib/data/profiles";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { updateLeadAction } from "@/app/(app)/leads/actions";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();

  let lead;
  try {
    lead = await getLead(id);
  } catch {
    notFound();
  }
  if (!lead) notFound();

  const [companies, stages, assignees, history] = await Promise.all([
    listCompanies(),
    listPipelineStages(),
    listActiveProfiles(),
    getLeadStageHistory(id),
  ]);

  const boundAction = updateLeadAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/leads" className="text-sm text-muted-foreground hover:underline">
            ← Back to leads
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold">
              {lead.first_name} {lead.last_name}
            </h1>
            <Badge className="capitalize">{lead.pipeline_stages?.name}</Badge>
          </div>
          {lead.companies?.name && <p className="text-muted-foreground">{lead.companies.name}</p>}
        </div>
        {profile.role === "admin" && (
          <DeleteLeadButton leadId={lead.id} leadName={`${lead.first_name} ${lead.last_name}`} />
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Stage history</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Edit lead</CardTitle>
            </CardHeader>
            <CardContent>
              {canWrite(profile) ? (
                <LeadForm
                  action={boundAction}
                  companies={companies}
                  stages={stages}
                  assignees={assignees}
                  submitLabel="Save changes"
                  defaultValues={{
                    first_name: lead.first_name,
                    last_name: lead.last_name,
                    job_title: lead.job_title ?? "",
                    company_id: lead.company_id ?? "",
                    email: lead.email ?? "",
                    phone: lead.phone ?? "",
                    whatsapp: lead.whatsapp ?? "",
                    linkedin_url: lead.linkedin_url ?? "",
                    country: lead.country ?? "",
                    city: lead.city ?? "",
                    source: lead.source ?? "",
                    pipeline_stage_id: lead.pipeline_stage_id,
                    assigned_to: lead.assigned_to ?? "",
                    lead_score: lead.lead_score,
                    temperature: lead.temperature,
                    next_follow_up_at: lead.next_follow_up_at?.slice(0, 16) ?? "",
                    notes: lead.notes ?? "",
                  }}
                />
              ) : (
                <p className="text-muted-foreground">You have read-only access to this lead.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Stage history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.length === 0 && <p className="text-muted-foreground">No history yet.</p>}
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between border-b pb-2 text-sm last:border-0">
                  <span>
                    {h.from_stage?.name ?? "—"} → <strong>{h.to_stage?.name}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    {h.profiles?.full_name ?? "System"} · {new Date(h.changed_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
