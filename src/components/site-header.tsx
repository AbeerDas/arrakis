import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Public (logged-out) site header — a floating frosted-glass pill. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-2xl px-4 shadow-sm sm:px-5">
        <Link href="/" className="flex items-center gap-2">
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

        <nav className="flex items-center gap-5 sm:gap-6">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground hidden text-sm underline-offset-4 transition-colors hover:underline sm:inline"
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "sm" }), "rounded-xl")}
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
