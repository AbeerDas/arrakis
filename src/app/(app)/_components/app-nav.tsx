import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/startups", label: "Startups" },
  { href: "/tracker", label: "Tracker" },
  { href: "/settings", label: "Settings" },
];

export function AppNav({
  isAdmin,
  email,
}: {
  isAdmin: boolean;
  email: string;
}) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-1">
          <Link href="/dashboard" className="mr-3 font-semibold tracking-tight">
            Arrakis
          </Link>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {n.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Admin
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {email}
          </span>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
