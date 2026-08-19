"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireProfile, requireAdmin, canWrite } from "@/lib/auth/dal";
import { taskSchema } from "@/lib/validations/task";
import { createTask, completeTask, deleteTask } from "@/lib/data/tasks";

export interface TaskFormState {
  error?: string;
  errors?: Record<string, string[]>;
}

export async function createTaskAction(_prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const profile = await requireProfile();
  if (!canWrite(profile)) {
    return { error: "You do not have permission to create tasks." };
  }

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    lead_id: formData.get("lead_id"),
    assigned_to: formData.get("assigned_to"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    due_at: formData.get("due_at"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await createTask(parsed.data, profile.id);
  } catch {
    return { error: "Failed to create task. Please try again." };
  }

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function completeTaskAction(taskId: string) {
  const profile = await requireProfile();
  if (!canWrite(profile)) {
    throw new Error("You do not have permission to complete tasks.");
  }
  await completeTask(taskId);
  revalidatePath("/tasks");
}

// Admin-only, matches tasks_delete_admin RLS policy.
export async function deleteTaskAction(taskId: string) {
  await requireAdmin();
  await deleteTask(taskId);
  revalidatePath("/tasks");
}
