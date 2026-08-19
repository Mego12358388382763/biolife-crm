"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/dal";
import { dailyActivitySchema } from "@/lib/validations/daily-activity";
import { upsertDailyReport } from "@/lib/data/daily-activity";

export interface DailyActivityFormState {
  error?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

export async function submitDailyReportAction(
  _prevState: DailyActivityFormState,
  formData: FormData,
): Promise<DailyActivityFormState> {
  const profile = await requireProfile();

  const raw = Object.fromEntries(formData.entries());
  const parsed = dailyActivitySchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await upsertDailyReport(parsed.data, profile.id);
  } catch {
    return { error: "Failed to save your report. Please try again." };
  }

  revalidatePath("/reports");
  revalidatePath("/reports/daily");
  revalidatePath("/reports/dashboard");
  return { success: true };
}
