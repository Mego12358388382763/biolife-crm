"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deleteLeadAction, deleteLeadsAction } from "@/app/(app)/leads/actions";
import { leadDisplayName } from "@/lib/utils";

const TEMPERATURE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  hot: "default",
  warm: "secondary",
  cold: "outline",
};

interface LeadRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  country: string | null;
  source: string | null;
  lead_score: number;
  temperature: string;
  next_follow_up_at: string | null;
  companies: { name: string } | null;
  pipeline_stages: { name: string } | null;
  profiles: { full_name: string } | null;
}

export function LeadsTable({ leads, isAdmin }: { leads: LeadRow[]; isAdmin: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const colSpan = isAdmin ? 10 : 9;

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(leads.map((l) => l.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleBulkDelete() {
    startTransition(async () => {
      try {
        await deleteLeadsAction([...selected]);
        toast.success(`Deleted ${selected.size} lead(s).`);
        setSelected(new Set());
      } catch {
        toast.error("Failed to delete selected leads.");
      }
    });
  }

  const allSelected = leads.length > 0 && selected.size === leads.length;

  return (
    <div className="space-y-3">
      {isAdmin && selected.size > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-4 py-2">
          <span className="text-sm">{selected.size} selected</span>
          <Button variant="destructive" size="sm" disabled={pending} onClick={handleBulkDelete}>
            {pending ? "Deleting..." : "Delete selected"}
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label="Select all leads"
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Next Follow-up</TableHead>
              {isAdmin && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                {isAdmin && (
                  <TableCell>
                    <Checkbox
                      checked={selected.has(lead.id)}
                      onCheckedChange={(checked) => toggleOne(lead.id, checked === true)}
                      aria-label={`Select ${leadDisplayName(lead)}`}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                    {leadDisplayName(lead)}
                  </Link>
                  <Badge variant={TEMPERATURE_VARIANT[lead.temperature]} className="ml-2 capitalize">
                    {lead.temperature}
                  </Badge>
                </TableCell>
                <TableCell>{lead.companies?.name ?? "—"}</TableCell>
                <TableCell>{lead.job_title ?? "—"}</TableCell>
                <TableCell>{lead.country ?? "—"}</TableCell>
                <TableCell>{lead.source ?? "—"}</TableCell>
                <TableCell>{lead.pipeline_stages?.name ?? "—"}</TableCell>
                <TableCell>{lead.lead_score}</TableCell>
                <TableCell>{lead.profiles?.full_name ?? "Unassigned"}</TableCell>
                <TableCell>
                  {lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleDateString() : "—"}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <DeleteConfirmDialog
                      triggerLabel="Delete"
                      title={`Delete ${leadDisplayName(lead)}?`}
                      description="This permanently deletes the lead and its stage history. This cannot be undone."
                      onConfirm={() => deleteLeadAction(lead.id)}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
