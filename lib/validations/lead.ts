import * as z from "zod";
import { idSchema } from "./shared";

export const leadSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  job_title: z.string().trim().max(150).optional().or(z.literal("")),
  company_id: idSchema.optional().or(z.literal("")),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  linkedin_url: z.url("Enter a valid URL").optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  source: z.string().trim().max(100).optional().or(z.literal("")),
  pipeline_stage_id: z.string().min(1, "Select a pipeline stage").pipe(idSchema),
  assigned_to: idSchema.optional().or(z.literal("")),
  lead_score: z.coerce.number().int().min(0).max(100),
  temperature: z.enum(["hot", "warm", "cold"]),
  next_follow_up_at: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;
