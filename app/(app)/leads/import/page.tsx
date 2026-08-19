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
          <p className="font-medium">Recognized columns (case-insensitive, any order, Arabic supported):</p>
          <p className="mt-1 text-muted-foreground">
            Name / Full Name, First Name, Last Name, Email, Phone, WhatsApp, LinkedIn, Job Title, Company, Country,
            City, Source, Notes
          </p>
          <p className="mt-2 text-muted-foreground">
            A row just needs a name, an email, or a phone number — nothing else is required. A single &quot;Name&quot;
            column is kept as-is (never guessed apart into first/last). You&apos;ll see a preview with column
            mapping, duplicates, and any invalid rows before anything is imported.
          </p>
        </div>
        <ImportForm />
      </CardContent>
    </Card>
  );
}
