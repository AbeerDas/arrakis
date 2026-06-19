import type { Metadata } from "next";
import Link from "next/link";
import { signUp } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check_email?: string }>;
}) {
  const sp = await searchParams;

  if (sp.check_email) {
    return (
      <div className="glass rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          We sent you a confirmation link. Click it to finish creating your
          account.
        </p>
        <Link
          href="/login"
          className="text-spice mt-5 inline-block text-sm underline-offset-4 hover:underline"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight">
        Create your Arrakis account
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">Free to start.</p>

      {sp.error ? (
        <p className="text-destructive mt-4 text-sm">{sp.error}</p>
      ) : null}

      <form action={signUp} className="mt-6 space-y-4">
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
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full rounded-xl">
          Sign up
        </Button>
      </form>

      <p className="text-muted-foreground mt-5 text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-spice underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
