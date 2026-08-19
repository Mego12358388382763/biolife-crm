"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { resetCrmData, createTeamUser, type CreateUserResult } from "@/lib/data/settings";
import { RESET_CONFIRMATION_PHRASE } from "@/lib/constants";

// Plain async function rather than a useActionState-style action: the
// calling component needs to close its own dialog exactly once, right after
// a successful call, from inside the click handler that invoked it — not by
// syncing to a returned state in an effect a render later.
export async function resetCrmDataAction(confirmation: string): Promise<void> {
  await requireAdmin();

  if (confirmation !== RESET_CONFIRMATION_PHRASE) {
    throw new Error(`You must type "${RESET_CONFIRMATION_PHRASE}" exactly to confirm.`);
  }

  await resetCrmData();
  revalidatePath("/", "layout");
}

const createUserSchema = z.object({
  email: z.email("Enter a valid email"),
  full_name: z.string().trim().min(1, "Full name is required"),
  role: z.enum(["admin", "growth_operations", "read_only"]),
});

export interface CreateUserState {
  error?: string;
  errors?: Record<string, string[]>;
  result?: CreateUserResult;
}

export async function createTeamUserAction(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const result = await createTeamUser(parsed.data.email, parsed.data.full_name, parsed.data.role);
    revalidatePath("/settings");
    return { result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create user.";
    return { error: message };
  }
}
