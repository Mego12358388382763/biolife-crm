"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resetCrmDataAction } from "@/app/(app)/settings/actions";
import { RESET_CONFIRMATION_PHRASE } from "@/lib/constants";

const DELETED_ITEMS = ["Leads", "Companies", "Tasks", "Lead stage history"];
const PRESERVED_ITEMS = ["User accounts and roles", "Pipeline stages configuration", "Authentication and app settings"];

export function ResetDataSection() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [typedPhrase, setTypedPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setStep(1);
      setTypedPhrase("");
      setError(null);
    }
  }

  function handleReset() {
    startTransition(async () => {
      try {
        await resetCrmDataAction(typedPhrase);
        handleOpenChange(false);
        setSucceeded(true);
        toast.success("CRM data reset.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reset CRM data.");
      }
    });
  }

  const phraseMatches = typedPhrase === RESET_CONFIRMATION_PHRASE;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Permanently delete all operational CRM records and return the CRM to a clean state.
      </p>
      {succeeded && (
        <Alert>
          <AlertTitle>CRM data reset</AlertTitle>
          <AlertDescription>All leads, companies, tasks, and stage history have been deleted.</AlertDescription>
        </Alert>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger render={<Button variant="destructive" />}>Delete All CRM Data</DialogTrigger>
        <DialogContent>
          {step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle>Warning: this cannot be undone</DialogTitle>
                <DialogDescription>
                  This action permanently deletes all CRM operational data and cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-destructive">Will be deleted</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
                    {DELETED_ITEMS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Will be preserved</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
                    {PRESERVED_ITEMS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => setStep(2)}>
                  I understand, continue
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Type to confirm</DialogTitle>
                <DialogDescription>
                  Type <strong>{RESET_CONFIRMATION_PHRASE}</strong> exactly to enable the delete button.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="confirmation" className="sr-only">
                  Confirmation phrase
                </Label>
                <Input
                  id="confirmation"
                  name="confirmation"
                  value={typedPhrase}
                  onChange={(e) => setTypedPhrase(e.target.value)}
                  placeholder={RESET_CONFIRMATION_PHRASE}
                  autoComplete="off"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" variant="destructive" disabled={!phraseMatches || pending} onClick={handleReset}>
                  {pending ? "Deleting..." : "Permanently Delete Data"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
