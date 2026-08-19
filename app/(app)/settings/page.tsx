import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/dal";
import { listAllProfiles } from "@/lib/data/settings";
import { CreateUserForm } from "@/components/settings/create-user-form";
import { QrAccess } from "@/components/settings/qr-access";
import { ResetDataSection } from "@/components/settings/reset-data-section";

export default async function SettingsPage() {
  await requireAdmin();
  const profiles = await listAllProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">System configuration and user management (admin only).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.full_name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell className="capitalize">{p.role.replace("_", " ")}</TableCell>
                  <TableCell>
                    <Badge variant={p.active ? "default" : "outline"}>{p.active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create team account</CardTitle>
          <CardDescription>
            Creates a real Supabase Auth account with a securely generated password — never hardcoded and shown to
            you only once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QR Access</CardTitle>
          <CardDescription>Scan to open the CRM login page on another device.</CardDescription>
        </CardHeader>
        <CardContent>
          <QrAccess />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Reset CRM Data</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetDataSection />
        </CardContent>
      </Card>
    </div>
  );
}
