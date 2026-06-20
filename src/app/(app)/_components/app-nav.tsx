import { Settings } from "lucide-react";
import Link from "next/link";
import { ArrakisLogo } from "@/components/arrakis-logo";

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
      <div className="glass-nav mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 rounded-2xl px-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:px-5">
        <Link
          href="/startups"
          className="flex items-baseline gap-2 justify-self-start text-lg sm:text-xl"
        >
          <ArrakisLogo className="h-[0.78em] w-auto shrink-0" />
          <span className="font-semibold tracking-tight">Arrakis</span>
        </Link>

        <nav className="flex items-center gap-4 justify-self-center sm:gap-6">
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

        <div className="flex items-center gap-5 justify-self-end">
          <Link
            href="/settings"
            aria-label="Settings"
            title="Settings"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
