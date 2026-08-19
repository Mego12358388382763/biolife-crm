"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  triggerLabel: string;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  onDeleted?: () => void;
  triggerVariant?: "outline" | "destructive" | "ghost";
  triggerSize?: "sm" | "default";
}

export function DeleteConfirmDialog({
  triggerLabel,
  title,
  description,
  onConfirm,
  onDeleted,
  triggerVariant = "outline",
  triggerSize = "sm",
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await onConfirm();
        setOpen(false);
        toast.success("Deleted successfully.");
        onDeleted?.();
      } catch {
        toast.error("Failed to delete. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={triggerVariant} size={triggerSize} />}>{triggerLabel}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
