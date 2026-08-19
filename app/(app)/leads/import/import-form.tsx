"use client";

import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { previewImportAction, commitImportAction, type PreviewFormState } from "./actions";
import type { ImportResult, PreviewRow } from "@/lib/data/lead-import";

const initialState: PreviewFormState = {};

function downloadErrorReport(errors: ImportResult["errors"]) {
  const header = "Row,Reason\n";
  const body = errors.map((e) => `${e.rowNumber},"${e.reason.replace(/"/g, '""')}"`).join("\n");
  const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "import-errors.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function ImportForm() {
  const [state, formAction, previewPending] = useActionState(previewImportAction, initialState);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [committing, startCommit] = useTransition();

  const preview = state.preview;

  function handleConfirm() {
    if (!preview) return;
    startCommit(async () => {
      try {
        const outcome = await commitImportAction(preview.rows);
        setResult(outcome);
        toast.success(`Imported ${outcome.created} lead(s).`);
      } catch {
        toast.error("Import failed. Please try again.");
      }
    });
  }

  // Result screen — compact summary, not a wall of raw errors.
  if (result) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTitle>
            {result.created + result.duplicates + result.invalid} rows processed
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{result.created} imported</Badge>
              <Badge variant="secondary">{result.duplicates} duplicates skipped</Badge>
              {result.invalid > 0 && <Badge variant="destructive">{result.invalid} invalid</Badge>}
            </div>
          </AlertDescription>
        </Alert>
        {result.errors.length > 0 && (
          <details className="rounded-md border p-3 text-sm">
            <summary className="cursor-pointer font-medium">
              View {result.errors.length} invalid row(s)
            </summary>
            <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
              {result.errors.slice(0, 100).map((e) => (
                <li key={e.rowNumber} className="text-muted-foreground">
                  Row {e.rowNumber}: {e.reason}
                </li>
              ))}
            </ul>
            {result.errors.length > 100 && (
              <p className="mt-2 text-muted-foreground">
                Showing first 100 of {result.errors.length}. Download the full report below.
              </p>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => downloadErrorReport(result.errors)}
            >
              Download error report (CSV)
            </Button>
          </details>
        )}
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Import another file
        </Button>
      </div>
    );
  }

  // Preview screen — shown after a file has been parsed, before anything
  // is written to the database.
  if (preview) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{preview.validCount} valid</Badge>
          <Badge variant="secondary">{preview.duplicateCount} duplicates</Badge>
          {preview.invalidCount > 0 && <Badge variant="destructive">{preview.invalidCount} invalid</Badge>}
          <span className="text-sm text-muted-foreground">of {preview.totalRows} rows total</span>
        </div>

        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Column mapping</p>
          <p className="mt-1 text-muted-foreground">
            {preview.mapping.mappedFields.map((m) => `"${m.column}" → ${m.field}`).join(", ") || "No columns matched"}
          </p>
          {preview.mapping.unmappedColumns.length > 0 && (
            <p className="mt-2 text-muted-foreground">
              Ignored (not recognized): {preview.mapping.unmappedColumns.join(", ")}
            </p>
          )}
        </div>

        {preview.sampleRows.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.sampleRows.map((r: PreviewRow) => (
                  <TableRow key={r.rowNumber}>
                    <TableCell>{r.rowNumber}</TableCell>
                    <TableCell>{[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}</TableCell>
                    <TableCell>{r.email ?? "—"}</TableCell>
                    <TableCell>{r.phone ?? "—"}</TableCell>
                    <TableCell>{r.company ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="p-2 text-xs text-muted-foreground">Showing first {preview.sampleRows.length} valid rows.</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={committing || preview.validCount === 0}>
            {committing ? "Importing..." : `Import ${preview.validCount} valid lead(s)`}
          </Button>
        </div>
      </div>
    );
  }

  // Upload screen.
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">CSV file</Label>
        <Input id="file" name="file" type="file" accept=".csv,text/csv" required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={previewPending}>
        {previewPending ? "Reading file..." : "Preview import"}
      </Button>
    </form>
  );
}
