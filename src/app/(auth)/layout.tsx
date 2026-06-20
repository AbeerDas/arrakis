import Link from "next/link";
import { ArrakisLogo } from "@/components/arrakis-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* left: desert panel with brand + tagline (hidden on small screens) */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/desert.jpg"
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[center_55%]"
        />
        {/* wash the bottom toward the page color so the ink tagline stays legible */}
        <div className="from-background/90 via-background/15 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex w-fit items-center gap-2">
            <ArrakisLogo className="h-6 w-auto" />
            <span className="text-lg font-semibold tracking-tight">
              Arrakis
            </span>
          </Link>
          <div>
            <p className="text-spice text-xs font-bold tracking-[0.28em] uppercase">
              Apply sharper, land faster
            </p>
            <h2 className="mt-3 max-w-md text-3xl leading-tight font-extrabold tracking-tight text-balance">
              Out-apply everyone.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
              Find the startups worth your shot and reach their founders with
              outreach that sounds like you.
            </p>
          </div>
        </div>
      </div>

      {/* right: the form */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 flex w-fit items-center gap-2 lg:hidden"
          >
            <ArrakisLogo className="h-6 w-auto" />
            <span className="text-lg font-semibold tracking-tight">
              Arrakis
            </span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
