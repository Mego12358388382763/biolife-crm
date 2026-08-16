import * as z from "zod";
import { idSchema } from "./shared";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  lead_id: idSchema.optional().or(z.literal("")),
  assigned_to: idSchema.optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  due_at: z.string().optional().or(z.literal("")),
});

export type TaskInput = z.infer<typeof taskSchema>;
