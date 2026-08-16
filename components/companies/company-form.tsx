"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CompanyFormState } from "@/app/(app)/companies/actions";

interface CompanyFormProps {
  action: (state: CompanyFormState, formData: FormData) => Promise<CompanyFormState>;
  defaultValues?: Partial<{
    name: string;
    website: string;
    industry: string;
    country: string;
    city: string;
    company_size: string;
    notes: string;
  }>;
  submitLabel?: string;
}

const initialState: CompanyFormState = {};

export function CompanyForm({ action, defaultValues = {}, submitLabel = "Save company" }: CompanyFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Company name</Label>
          <Input id="name" name="name" defaultValue={defaultValues.name} required />
          {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={defaultValues.website} placeholder="https://example.com" />
          {state.errors?.website && <p className="text-sm text-destructive">{state.errors.website[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" name="industry" defaultValue={defaultValues.industry} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_size">Company size</Label>
          <Input id="company_size" name="company_size" placeholder="e.g. 1-10, 50-200" defaultValue={defaultValues.company_size} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={defaultValues.country} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={defaultValues.city} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={defaultValues.notes} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
