"use client";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deleteTaskAction } from "@/app/(app)/tasks/actions";

export function DeleteTaskButton({ taskId, taskTitle }: { taskId: string; taskTitle: string }) {
  return (
    <DeleteConfirmDialog
      triggerLabel="Delete"
      title={`Delete "${taskTitle}"?`}
      description="This permanently deletes the task. This cannot be undone."
      onConfirm={() => deleteTaskAction(taskId)}
    />
  );
}
