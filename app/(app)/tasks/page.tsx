import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompleteTaskButton } from "@/components/tasks/complete-task-button";
import { listTasks, type TaskView } from "@/lib/data/tasks";
import { requireProfile, canWrite } from "@/lib/auth/dal";

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

async function TaskList({ view, canComplete }: { view: TaskView; canComplete: boolean }) {
  const tasks = await listTasks(view);

  if (tasks.length === 0) {
    return <p className="text-muted-foreground">No tasks here.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground">
                {task.leads ? `${task.leads.first_name} ${task.leads.last_name} · ` : ""}
                {task.profiles?.full_name ?? "Unassigned"}
                {task.due_at ? ` · Due ${new Date(task.due_at).toLocaleString()}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={PRIORITY_VARIANT[task.priority]} className="capitalize">
                {task.priority}
              </Badge>
              {canComplete && task.status !== "completed" && task.status !== "cancelled" && (
                <CompleteTaskButton taskId={task.id} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireProfile();
  const view = (params.view as TaskView) ?? "today";
  const writable = canWrite(profile);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        {writable && (
          <Button render={<Link href="/tasks/new" />} nativeButton={false}>
            New task
          </Button>
        )}
      </div>

      <Tabs defaultValue={view}>
        <TabsList>
          <TabsTrigger value="today" render={<Link href="/tasks?view=today" />} nativeButton={false}>
            Today
          </TabsTrigger>
          <TabsTrigger value="upcoming" render={<Link href="/tasks?view=upcoming" />} nativeButton={false}>
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="overdue" render={<Link href="/tasks?view=overdue" />} nativeButton={false}>
            Overdue
          </TabsTrigger>
          <TabsTrigger value="completed" render={<Link href="/tasks?view=completed" />} nativeButton={false}>
            Completed
          </TabsTrigger>
        </TabsList>
        <TabsContent value={view}>
          <TaskList view={view} canComplete={writable} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
