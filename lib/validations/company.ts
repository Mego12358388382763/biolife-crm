import * as z from "zod";

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200),
  website: z.url("Enter a valid URL").optional().or(z.literal("")),
  industry: z.string().trim().max(150).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  company_size: z.string().trim().max(50).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type CompanyInput = z.infer<typeof companySchema>;
