import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { ImportForm } from "./import-form";

export default async function ImportLeadsPage() {
  const profile = await requireProfile();
  if (!canWrite(profile)) redirect("/leads");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Import leads from CSV</CardTitle>
        <CardDescription>
          Upload a CSV file with your contacts. Exported from Excel or Google Sheets? Use &quot;Save as / Export
          &rarr; CSV&quot; first.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Recognized columns (case-insensitive, any order):</p>
          <p className="mt-1 text-muted-foreground">
            First Name*, Last Name*, Email, Phone, WhatsApp, LinkedIn, Job Title, Company, Country, City, Source,
            Notes
          </p>
          <p className="mt-2 text-muted-foreground">
            New leads start in the &quot;New&quot; pipeline stage. Companies are matched by name or created
            automatically. Rows with an email matching an existing lead are skipped.
          </p>
        </div>
        <ImportForm />
      </CardContent>
    </Card>
  );
}
