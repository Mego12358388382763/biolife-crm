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
import type { TaskFormState } from "@/app/(app)/tasks/actions";
import { leadDisplayName } from "@/lib/utils";

interface TaskFormProps {
  action: (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  leads: { id: string; first_name: string | null; last_name: string | null; email: string | null; phone: string | null }[];
  assignees: { id: string; full_name: string }[];
}

const initialState: TaskFormState = {};

const PRIORITY_ITEMS = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };
const STATUS_ITEMS = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function TaskForm({ action, leads, assignees }: TaskFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const leadItems = Object.fromEntries(leads.map((l) => [l.id, leadDisplayName(l)]));
  const assigneeItems = Object.fromEntries(assignees.map((a) => [a.id, a.full_name]));

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
        {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lead_id">Linked lead</Label>
          <Select name="lead_id" items={leadItems}>
            <SelectTrigger id="lead_id" className="w-full">
              <SelectValue placeholder="No linked lead" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {leadDisplayName(l)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assigned to</Label>
          <Select name="assigned_to" items={assigneeItems}>
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
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" items={PRIORITY_ITEMS} defaultValue="medium">
            <SelectTrigger id="priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" items={STATUS_ITEMS} defaultValue="pending">
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_at">Due date</Label>
          <Input id="due_at" name="due_at" type="datetime-local" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create task"}
      </Button>
    </form>
  );
}
