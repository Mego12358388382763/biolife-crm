import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from "@/components/tasks/task-form";
import { createTaskAction } from "@/app/(app)/tasks/actions";
import { listLeads } from "@/lib/data/leads";
import { listActiveProfiles } from "@/lib/data/profiles";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { redirect } from "next/navigation";

export default async function NewTaskPage() {
  const profile = await requireProfile();
  if (!canWrite(profile)) redirect("/tasks");

  const [leads, assignees] = await Promise.all([listLeads(), listActiveProfiles()]);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New task</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskForm action={createTaskAction} leads={leads} assignees={assignees} />
      </CardContent>
    </Card>
  );
}
