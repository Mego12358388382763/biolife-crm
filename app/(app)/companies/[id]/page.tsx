import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyForm } from "@/components/companies/company-form";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";
import { leadDisplayName } from "@/lib/utils";
import { getCompany, getCompanyLeads } from "@/lib/data/companies";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { updateCompanyAction } from "@/app/(app)/companies/actions";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();

  let company;
  try {
    company = await getCompany(id);
  } catch {
    notFound();
  }
  if (!company) notFound();

  const leads = await getCompanyLeads(id);
  const boundAction = updateCompanyAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/companies" className="text-sm text-muted-foreground hover:underline">
            ← Back to companies
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{company.name}</h1>
        </div>
        {profile.role === "admin" && (
          <DeleteCompanyButton companyId={company.id} companyName={company.name} redirectAfter />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company details</CardTitle>
          </CardHeader>
          <CardContent>
            {canWrite(profile) ? (
              <CompanyForm
                action={boundAction}
                submitLabel="Save changes"
                defaultValues={{
                  name: company.name,
                  website: company.website ?? "",
                  industry: company.industry ?? "",
                  country: company.country ?? "",
                  city: company.city ?? "",
                  company_size: company.company_size ?? "",
                  notes: company.notes ?? "",
                }}
              />
            ) : (
              <p className="text-muted-foreground">You have read-only access to this company.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Associated leads ({leads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No leads yet.
                    </TableCell>
                  </TableRow>
                )}
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Link href={`/leads/${lead.id}`} className="hover:underline">
                        {leadDisplayName(lead)}
                      </Link>
                    </TableCell>
                    <TableCell>{lead.pipeline_stages?.name ?? "—"}</TableCell>
                    <TableCell>{lead.profiles?.full_name ?? "Unassigned"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
