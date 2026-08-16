"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { importLeadsAction, type ImportFormState } from "./actions";

const initialState: ImportFormState = {};

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importLeadsAction, initialState);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">CSV file</Label>
          <Input id="file" name="file" type="file" accept=".csv,text/csv" required />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Importing..." : "Import leads"}
        </Button>
      </form>

      {state.summary && (
        <Alert>
          <AlertTitle>
            Imported {state.summary.created} of {state.summary.totalRows} rows
          </AlertTitle>
          <AlertDescription>
            {state.summary.skipped.length === 0 ? (
              <p>All rows imported successfully.</p>
            ) : (
              <div className="mt-2 space-y-1">
                <p>{state.summary.skipped.length} row(s) skipped:</p>
                <ul className="list-disc space-y-0.5 pl-5 text-sm">
                  {state.summary.skipped.map((s) => (
                    <li key={s.rowNumber}>
                      Row {s.rowNumber}: {s.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
