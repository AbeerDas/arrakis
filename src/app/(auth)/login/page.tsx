import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="glass rounded-2xl p-8 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight">Log in to Arrakis</h1>
      <p className="text-muted-foreground mt-1 text-sm">Welcome back.</p>

      {sp.error ? (
        <p className="text-destructive mt-4 text-sm">{sp.error}</p>
      ) : null}

      <form action={signIn} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={sp.next ?? "/startups"} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full rounded-xl">
          Log in
        </Button>
      </form>

      <p className="text-muted-foreground mt-5 text-sm">
        No account?{" "}
        <Link
          href="/signup"
          className="text-spice underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
