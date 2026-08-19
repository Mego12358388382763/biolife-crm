"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { moveLeadStageAction } from "@/app/(app)/leads/actions";
import { leadDisplayName } from "@/lib/utils";
import type { PipelineStage } from "@/types/database";

interface PipelineLead {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  temperature: string;
  pipeline_stage_id: string;
  companies: { name: string } | null;
  profiles: { full_name: string } | null;
}

const TEMPERATURE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  hot: "default",
  warm: "secondary",
  cold: "outline",
};

function LeadCard({ lead }: { lead: PipelineLead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab p-0 ${isDragging ? "opacity-50" : ""}`}
    >
      <CardContent className="space-y-1 p-3">
        <Link
          href={`/leads/${lead.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-medium hover:underline"
        >
          {leadDisplayName(lead)}
        </Link>
        <p className="text-xs text-muted-foreground">{lead.companies?.name ?? "No company"}</p>
        <div className="flex items-center justify-between">
          <Badge variant={TEMPERATURE_VARIANT[lead.temperature]} className="capitalize">
            {lead.temperature}
          </Badge>
          <span className="text-xs text-muted-foreground">{lead.profiles?.full_name ?? "Unassigned"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StageColumn({ stage, leads }: { stage: PipelineStage; leads: PipelineLead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-md border bg-muted/20 ${isOver ? "ring-2 ring-primary" : ""}`}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">{stage.name}</span>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>
      <div className="flex-1 space-y-2 p-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

export function PipelineBoard({
  stages,
  initialLeads,
  canWrite,
}: {
  stages: PipelineStage[];
  initialLeads: PipelineLead[];
  canWrite: boolean;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeLead, setActiveLead] = useState<PipelineLead | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragStart(event: DragStartEvent) {
    const lead = leads.find((l) => l.id === event.active.id);
    setActiveLead(lead ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;
    if (!over || !canWrite) return;

    const leadId = String(active.id);
    const toStageId = String(over.id);
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.pipeline_stage_id === toStageId) return;

    const previousStageId = lead.pipeline_stage_id;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, pipeline_stage_id: toStageId } : l)));

    startTransition(async () => {
      try {
        await moveLeadStageAction(leadId, toStageId);
      } catch {
        toast.error("Failed to move lead. Reverting.");
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, pipeline_stage_id: previousStageId } : l)));
      }
    });
  }

  return (
    <DndContext
      id="pipeline-board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <StageColumn key={stage.id} stage={stage} leads={leads.filter((l) => l.pipeline_stage_id === stage.id)} />
        ))}
      </div>
      <DragOverlay>{activeLead ? <LeadCard lead={activeLead} /> : null}</DragOverlay>
    </DndContext>
  );
}
