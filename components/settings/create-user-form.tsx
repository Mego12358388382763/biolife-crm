"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createTeamUserAction, type CreateUserState } from "@/app/(app)/settings/actions";

const initialState: CreateUserState = {};

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createTeamUserAction, initialState);
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    if (!state.result) return;
    await navigator.clipboard.writeText(state.result.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" required />
          {state.errors?.full_name && <p className="text-sm text-destructive">{state.errors.full_name[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
          {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select name="role" defaultValue="growth_operations">
            <SelectTrigger id="role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="growth_operations">Growth &amp; Operations (general team access)</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="read_only">Read only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create account"}
          </Button>
        </div>
      </form>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      {state.result && (
        <Alert>
          <AlertTitle>Account created for {state.result.email}</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              This password is shown only once — copy it now and share it with the user securely (it is not stored
              anywhere retrievable, including this app).
            </p>
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1 font-mono text-sm">{state.result.password}</code>
              <Button type="button" size="sm" variant="outline" onClick={copyPassword}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
