"use client";

import { useRouter } from "next/navigation";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deleteCompanyAction } from "@/app/(app)/companies/actions";

export function DeleteCompanyButton({
  companyId,
  companyName,
  redirectAfter = false,
}: {
  companyId: string;
  companyName: string;
  redirectAfter?: boolean;
}) {
  const router = useRouter();

  return (
    <DeleteConfirmDialog
      triggerLabel="Delete"
      triggerVariant={redirectAfter ? "destructive" : "outline"}
      title={`Delete ${companyName}?`}
      description="This permanently deletes the company. Leads linked to it will keep their other details but lose this company association. This cannot be undone."
      onConfirm={() => deleteCompanyAction(companyId)}
      onDeleted={() => redirectAfter && router.push("/companies")}
    />
  );
}
