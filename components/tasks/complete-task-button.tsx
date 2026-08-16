"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { completeTaskAction } from "@/app/(app)/tasks/actions";

export function CompleteTaskButton({ taskId }: { taskId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await completeTaskAction(taskId);
            toast.success("Task completed");
          } catch {
            toast.error("Failed to complete task");
          }
        })
      }
    >
      {pending ? "Saving..." : "Complete"}
    </Button>
  );
}
