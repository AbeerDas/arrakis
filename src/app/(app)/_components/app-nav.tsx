import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";

const NAV = [
  { href: "/outreach", label: "Outreach" },
  { href: "/tracker", label: "Tracker" },
];

const linkClass =
  "text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline";

/** Authed app nav — sleek frosted pill; the wordmark links to the startups list. */
export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-2xl px-4 shadow-sm sm:px-5">
        <div className="flex items-center gap-6">
          <Link href="/startups" className="flex items-center gap-2">
            <Image
              src="/arrakis-mark.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain mix-blend-multiply"
              priority
            />
            <span className="text-lg font-semibold tracking-tight sm:text-xl">
              Arrakis
            </span>
          </Link>
          <nav className="flex items-center gap-5">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={linkClass}>
                {n.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link href="/admin" className={linkClass}>
                Admin
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/settings"
            aria-label="Settings"
            title="Settings"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="size-5" />
          </Link>
          <form action={signOut}>
            <button type="submit" className={linkClass}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
