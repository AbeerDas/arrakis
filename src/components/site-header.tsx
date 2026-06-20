import Link from "next/link";
import { ArrakisLogo } from "@/components/arrakis-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Public (logged-out) site header — a floating frosted-glass pill. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass-nav mx-auto grid h-14 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center rounded-2xl px-4 sm:px-5">
        <Link
          href="/"
          className="flex items-baseline gap-2 justify-self-start text-lg sm:text-xl"
        >
          <ArrakisLogo className="h-[0.78em] w-auto shrink-0" />
          <span className="font-semibold tracking-tight">Arrakis</span>
        </Link>

        <nav className="hidden items-center gap-6 justify-self-center sm:flex">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
          >
            Log in
          </Link>
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline sm:hidden"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "sm" }), "rounded-xl")}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
