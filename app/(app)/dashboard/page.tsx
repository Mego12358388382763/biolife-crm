import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ count: leadCount }, { count: companyCount }, { count: openTaskCount }, { count: overdueCount }] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("companies").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .in("status", ["pending", "in_progress"]),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .in("status", ["pending", "in_progress"])
        .lt("due_at", new Date().toISOString()),
    ]);

  const stats = [
    { label: "Total Leads", value: leadCount ?? 0 },
    { label: "Companies", value: companyCount ?? 0 },
    { label: "Open Tasks", value: openTaskCount ?? 0 },
    { label: "Overdue Tasks", value: overdueCount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {profile.full_name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening across the pipeline.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
