// Hand-authored types mirroring supabase/migrations/*.sql.
// Regenerate with `npm run db:types` once the local Supabase instance is
// running to keep this in sync with the real schema.

export type UserRole = "admin" | "growth_operations" | "read_only";
export type LeadTemperature = "hot" | "warm" | "cold";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  company_size: string | null;
  notes: string | null;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  position: number;
  active: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  company_id: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  linkedin_url: string | null;
  country: string | null;
  city: string | null;
  source: string | null;
  status: string;
  pipeline_stage_id: string;
  assigned_to: string | null;
  lead_score: number;
  temperature: LeadTemperature;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadStageHistory {
  id: string;
  lead_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  changed_by: string | null;
  changed_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  lead_id: string | null;
  assigned_to: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      companies: { Row: Company; Insert: Partial<Company>; Update: Partial<Company> };
      pipeline_stages: { Row: PipelineStage; Insert: Partial<PipelineStage>; Update: Partial<PipelineStage> };
      leads: { Row: Lead; Insert: Partial<Lead>; Update: Partial<Lead> };
      lead_stage_history: { Row: LeadStageHistory; Insert: Partial<LeadStageHistory>; Update: Partial<LeadStageHistory> };
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task> };
    };
  };
}
