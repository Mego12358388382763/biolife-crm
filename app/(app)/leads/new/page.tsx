import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "@/components/leads/lead-form";
import { createLeadAction } from "@/app/(app)/leads/actions";
import { listCompanies } from "@/lib/data/companies";
import { listPipelineStages } from "@/lib/data/leads";
import { listActiveProfiles } from "@/lib/data/profiles";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { redirect } from "next/navigation";

export default async function NewLeadPage() {
  const profile = await requireProfile();
  if (!canWrite(profile)) redirect("/leads");

  const [companies, stages, assignees] = await Promise.all([
    listCompanies(),
    listPipelineStages(),
    listActiveProfiles(),
  ]);

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>New lead</CardTitle>
      </CardHeader>
      <CardContent>
        <LeadForm action={createLeadAction} companies={companies} stages={stages} assignees={assignees} submitLabel="Create lead" />
      </CardContent>
    </Card>
  );
}
