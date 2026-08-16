import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyForm } from "@/components/companies/company-form";
import { createCompanyAction } from "@/app/(app)/companies/actions";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { redirect } from "next/navigation";

export default async function NewCompanyPage() {
  const profile = await requireProfile();
  if (!canWrite(profile)) redirect("/companies");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New company</CardTitle>
      </CardHeader>
      <CardContent>
        <CompanyForm action={createCompanyAction} submitLabel="Create company" />
      </CardContent>
    </Card>
  );
}
