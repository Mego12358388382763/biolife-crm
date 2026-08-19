import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth/dal";

export default async function ReportsIndexPage() {
  const profile = await requireProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground">Daily activity, conversion, and team performance.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/reports/daily">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>Submit today&apos;s outreach and conversion numbers.</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        </Link>
        <Link href="/reports/dashboard">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle>Performance Dashboard</CardTitle>
              <CardDescription>
                {profile.role === "admin"
                  ? "Funnel, team performance, and channel breakdown."
                  : "Your funnel and conversion rates."}
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        </Link>
      </div>
    </div>
  );
}
