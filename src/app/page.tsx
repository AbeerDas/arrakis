import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    title: "Startup database",
    body: "A sortable master list of early-stage startups, refreshed nightly from an open YC dataset.",
  },
  {
    title: "AI email generator",
    body: "Turn your resume and a role profile into a short, specific cold email — tweaked per company.",
  },
  {
    title: "Application tracker",
    body: "A private, spreadsheet-style pipeline. Notes, the email you sent, and custom stages per row.",
  },
  {
    title: "Verified contacts",
    body: "Founder and cofounder emails, personally verified. Unlock the full list with a one-time payment.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 py-24 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Find startups before they post jobs publicly.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Most early roles are filled through networks before a posting goes
            up. Arrakis surfaces new companies the day they appear, helps you
            send a sharp, resume-backed email to the right founder, and tracks
            every application in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Get started
            </Link>
            <Link
              href="/blog"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Read the blog
            </Link>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-lg border p-6">
              <h2 className="font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Arrakis</span>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
        </div>
      </footer>
    </>
  );
}
