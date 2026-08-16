import Image from "next/image";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from "@/types/database";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Header({ profile }: { profile: Profile }) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2 md:hidden">
        <Image src="/biolife-logo.webp" alt="BioLife Health" width={24} height={24} />
        <span className="font-semibold text-foreground">BioLife CRM</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium">{profile.full_name}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {profile.role.replace("_", " ")}
          </p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
