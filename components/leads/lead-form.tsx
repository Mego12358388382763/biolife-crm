"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Company, PipelineStage } from "@/types/database";
import type { LeadFormState } from "@/app/(app)/leads/actions";

interface LeadFormProps {
  action: (state: LeadFormState, formData: FormData) => Promise<LeadFormState>;
  companies: Pick<Company, "id" | "name">[];
  stages: PipelineStage[];
  assignees: { id: string; full_name: string }[];
  defaultValues?: Partial<{
    first_name: string;
    last_name: string;
    job_title: string;
    company_id: string;
    email: string;
    phone: string;
    whatsapp: string;
    linkedin_url: string;
    country: string;
    city: string;
    source: string;
    pipeline_stage_id: string;
    assigned_to: string;
    lead_score: number;
    temperature: string;
    next_follow_up_at: string;
    notes: string;
  }>;
  submitLabel?: string;
}

const initialState: LeadFormState = {};

const TEMPERATURE_ITEMS = { hot: "Hot", warm: "Warm", cold: "Cold" };

export function LeadForm({ action, companies, stages, assignees, defaultValues = {}, submitLabel = "Save lead" }: LeadFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const companyItems = Object.fromEntries(companies.map((c) => [c.id, c.name]));
  const stageItems = Object.fromEntries(stages.map((s) => [s.id, s.name]));
  const assigneeItems = Object.fromEntries(assignees.map((a) => [a.id, a.full_name]));

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" name="first_name" defaultValue={defaultValues.first_name} required />
          {state.errors?.first_name && <p className="text-sm text-destructive">{state.errors.first_name[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" name="last_name" defaultValue={defaultValues.last_name} required />
          {state.errors?.last_name && <p className="text-sm text-destructive">{state.errors.last_name[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Job title</Label>
          <Input id="job_title" name="job_title" defaultValue={defaultValues.job_title} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_id">Company</Label>
          <Select name="company_id" items={companyItems} defaultValue={defaultValues.company_id}>
            <SelectTrigger id="company_id" className="w-full">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultValues.email} />
          {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={defaultValues.phone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={defaultValues.whatsapp} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input id="linkedin_url" name="linkedin_url" defaultValue={defaultValues.linkedin_url} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={defaultValues.country} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={defaultValues.city} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input id="source" name="source" placeholder="e.g. LinkedIn, referral" defaultValue={defaultValues.source} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pipeline_stage_id">Pipeline stage</Label>
          <Select
            name="pipeline_stage_id"
            items={stageItems}
            defaultValue={defaultValues.pipeline_stage_id ?? stages[0]?.id}
          >
            <SelectTrigger id="pipeline_stage_id" className="w-full">
              <SelectValue placeholder="Select a stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.pipeline_stage_id && (
            <p className="text-sm text-destructive">{state.errors.pipeline_stage_id[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assigned to</Label>
          <Select name="assigned_to" items={assigneeItems} defaultValue={defaultValues.assigned_to}>
            <SelectTrigger id="assigned_to" className="w-full">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              {assignees.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead_score">Lead score (0-100)</Label>
          <Input
            id="lead_score"
            name="lead_score"
            type="number"
            min={0}
            max={100}
            defaultValue={defaultValues.lead_score ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature</Label>
          <Select name="temperature" items={TEMPERATURE_ITEMS} defaultValue={defaultValues.temperature ?? "cold"}>
            <SelectTrigger id="temperature" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="next_follow_up_at">Next follow-up</Label>
          <Input
            id="next_follow_up_at"
            name="next_follow_up_at"
            type="datetime-local"
            defaultValue={defaultValues.next_follow_up_at}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={defaultValues.notes} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
