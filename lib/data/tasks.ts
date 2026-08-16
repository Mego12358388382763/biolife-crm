import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TaskInput } from "@/lib/validations/task";

const TASK_SELECT =
  "*, leads(first_name, last_name), profiles!tasks_assigned_to_fkey(full_name)";

export type TaskView = "today" | "upcoming" | "overdue" | "completed";

export async function listTasks(view: TaskView) {
  const supabase = await createClient();
  let query = supabase.from("tasks").select(TASK_SELECT).is("deleted_at", null);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  switch (view) {
    case "today":
      query = query
        .in("status", ["pending", "in_progress"])
        .gte("due_at", startOfToday)
        .lt("due_at", endOfToday);
      break;
    case "upcoming":
      query = query.in("status", ["pending", "in_progress"]).gte("due_at", endOfToday);
      break;
    case "overdue":
      query = query.in("status", ["pending", "in_progress"]).lt("due_at", startOfToday);
      break;
    case "completed":
      query = query.eq("status", "completed");
      break;
  }

  const { data, error } = await query.order("due_at", { ascending: true });
  if (error) throw error;
  return data;
}

function cleanTaskInput(input: TaskInput) {
  return {
    title: input.title,
    description: input.description || null,
    lead_id: input.lead_id || null,
    assigned_to: input.assigned_to || null,
    priority: input.priority,
    status: input.status,
    due_at: input.due_at || null,
  };
}

export async function createTask(input: TaskInput, createdBy: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...cleanTaskInput(input), created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, input: TaskInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(cleanTaskInput(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeTask(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
