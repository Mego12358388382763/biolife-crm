---
name: zod-server-action
description: Write or review a Next.js Server Action / route handler in BioLife CRM so it authenticates, authorizes by role, validates every input with zod from lib/validations, and delegates to lib/data. Use whenever creating or modifying anything in an actions.ts file, a form submission, an API route, a bulk operation, or an import endpoint — and when reviewing one for security.
---

# Server Action pattern

Server Actions are public HTTP endpoints — anyone logged in can call them with any payload, regardless of what the UI shows. So each one does four things, in this order:

```ts
"use server";
export async function doThingAction(_prev: State, formData: FormData): Promise<State> {
  const profile = await requireProfile();            // 1. authenticate (redirects if not active)
  if (!canWrite(profile)) return { error: "..." };   // 2. authorize (or requireAdmin() for admin-only)
  const parsed = thingSchema.safeParse({...});       // 3. validate with zod from lib/validations/*
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  try { await doThing(parsed.data, profile.id); }    // 4. business logic lives in lib/data/*
  catch { return { error: "Friendly message" }; }    //    never leak DB error text to the client
  revalidatePath("/things");
}
```

## Rules

- IDs from forms/hidden fields: validate with `idSchema` (`lib/validations/shared.ts`), not `z.string().uuid()` (explained there).
- Bind extra args (`updateLeadAction.bind(null, leadId)`) are also untrusted — validate them.
- Bulk actions: validate the array (`z.array(idSchema).max(N)`) so one request can't touch unlimited rows.
- Admin-only actions (hard delete, reset, user management) call `requireAdmin()` and still rely on RLS as the second layer. The service-role client (`lib/supabase/admin.ts`) is only used after `requireAdmin()`.
- `redirect()` throws — call it outside try/catch.
- Never interpolate raw user text into PostgREST filter strings (`.or(...)`, `.filter(...)`); escape or restrict characters in the zod schema first.

## Review mode

When reviewing, check each action against the four steps and the rules, and report missing steps with file:line and a fix.
