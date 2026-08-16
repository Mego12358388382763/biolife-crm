import { requireProfile } from "@/lib/auth/dal";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={profile.role === "admin"} />
      <div className="flex flex-1 flex-col">
        <Header profile={profile} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
