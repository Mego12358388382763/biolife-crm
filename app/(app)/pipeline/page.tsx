import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { listLeadsForPipeline, listPipelineStages } from "@/lib/data/leads";
import { requireProfile, canWrite } from "@/lib/auth/dal";

export default async function PipelinePage() {
  const [profile, stages, leads] = await Promise.all([
    requireProfile(),
    listPipelineStages(),
    listLeadsForPipeline(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <p className="text-muted-foreground">Drag a lead card to move it between stages.</p>
      </div>
      <PipelineBoard stages={stages} initialLeads={leads} canWrite={canWrite(profile)} />
    </div>
  );
}
