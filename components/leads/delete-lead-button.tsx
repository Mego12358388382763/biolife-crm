"use client";

import { useRouter } from "next/navigation";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deleteLeadAction } from "@/app/(app)/leads/actions";

export function DeleteLeadButton({ leadId, leadName }: { leadId: string; leadName: string }) {
  const router = useRouter();

  return (
    <DeleteConfirmDialog
      triggerLabel="Delete lead"
      triggerVariant="destructive"
      title={`Delete ${leadName}?`}
      description="This permanently deletes the lead and its stage history. This cannot be undone."
      onConfirm={() => deleteLeadAction(leadId)}
      onDeleted={() => router.push("/leads")}
    />
  );
}
