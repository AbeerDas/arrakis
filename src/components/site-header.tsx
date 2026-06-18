import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Public (logged-out) site header used on the landing page and blog. */
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Arrakis
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/blog" className={cn(buttonVariants({ variant: "ghost" }))}>
            Blog
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants())}>
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
