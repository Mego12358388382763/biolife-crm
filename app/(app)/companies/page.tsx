import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCompanies } from "@/lib/data/companies";
import { requireProfile, canWrite } from "@/lib/auth/dal";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const [profile, companies] = await Promise.all([requireProfile(), listCompanies(params.q)]);
  const isAdmin = profile.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-muted-foreground">{companies.length} companies</p>
        </div>
        {canWrite(profile) && (
          <Button render={<Link href="/companies/new" />} nativeButton={false}>
            New company
          </Button>
        )}
      </div>

      <form method="get" className="flex gap-3">
        <Input name="q" placeholder="Search companies" defaultValue={params.q} className="max-w-xs" />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Size</TableHead>
              {isAdmin && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground">
                  No companies found.
                </TableCell>
              </TableRow>
            )}
            {companies.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/companies/${c.id}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell>{c.industry ?? "—"}</TableCell>
                <TableCell>{c.country ?? "—"}</TableCell>
                <TableCell>{c.city ?? "—"}</TableCell>
                <TableCell>{c.company_size ?? "—"}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <DeleteCompanyButton companyId={c.id} companyName={c.name} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
